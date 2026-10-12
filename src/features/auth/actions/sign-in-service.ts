import "server-only"

import { APIError } from "better-auth/api"
import { eq, sql } from "drizzle-orm"
import { headers } from "next/headers"

import { auth } from "@/lib/auth/server"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { GENERIC_ERROR_MESSAGE, logError } from "@/lib/errors"

import type { SignInInput, SignInState } from "../types/sign-in"
import { failureOutcome, isLocked, MAX_FAILED_ATTEMPTS, secondsUntil } from "../utils/lockout"

type SignInResult = SignInState | { status: "success"; mustChangePassword: boolean }

/**
 * Counts a failed attempt atomically and locks the account once it reaches
 * `MAX_FAILED_ATTEMPTS` (FR-IAM-002). Returns the state the form should show.
 */
async function recordFailure(userId: string): Promise<SignInState> {
  const [{ failedLoginCount }] = await db
    .update(users)
    .set({ failedLoginCount: sql`${users.failedLoginCount} + 1` })
    .where(eq(users.id, userId))
    .returning({ failedLoginCount: users.failedLoginCount })

  const now = new Date()
  const outcome = failureOutcome(failedLoginCount, now)
  if (!outcome.lockedUntil) return { status: "invalid", attemptsLeft: outcome.attemptsLeft }

  await db
    .update(users)
    .set({ failedLoginCount: 0, lockedUntil: outcome.lockedUntil })
    .where(eq(users.id, userId))
  return { status: "locked", retryAfterSeconds: secondsUntil(outcome.lockedUntil, now) }
}

/** Clears the failure counter and any lock, and stamps `last_login_at`. */
async function recordSuccess(userId: string) {
  await db
    .update(users)
    .set({ failedLoginCount: 0, lockedUntil: null, lastLoginAt: new Date() })
    .where(eq(users.id, userId))
}

/**
 * Signs a user in by username and password through Better Auth, enforcing the lockout
 * and deactivation rules (FR-IAM-002, FR-IAM-003). On success Better Auth creates the
 * session and `nextCookies()` sets the cookie; success reports whether the user still has to
 * replace an admin-issued password. Expected outcomes are returned as values;
 * database failures throw and are handled by the calling Server Action.
 */
export async function signInWithUsername(input: SignInInput): Promise<SignInResult> {
  const [user] = await db
    .select({
      id: users.id,
      deactivatedAt: users.deactivatedAt,
      lockedUntil: users.lockedUntil,
      mustChangePassword: users.mustChangePassword,
    })
    .from(users)
    .where(eq(users.username, input.username.toLowerCase()))

  // Unknown usernames get the same response as a wrong password.
  if (!user) return { status: "invalid", attemptsLeft: MAX_FAILED_ATTEMPTS }
  if (user.deactivatedAt) return { status: "deactivated" }
  const now = new Date()
  if (user.lockedUntil && isLocked(user.lockedUntil, now)) {
    return { status: "locked", retryAfterSeconds: secondsUntil(user.lockedUntil, now) }
  }

  try {
    await auth.api.signInUsername({ body: input, headers: await headers() })
  } catch (error) {
    if (error instanceof APIError && error.status === "UNAUTHORIZED") return recordFailure(user.id)
    logError(error, "auth.signInWithUsername", { userId: user.id })
    return { status: "error", message: GENERIC_ERROR_MESSAGE }
  }

  // The session already exists, so bookkeeping failures are logged without failing sign-in.
  await recordSuccess(user.id).catch((error) =>
    logError(error, "auth.recordSuccess", { userId: user.id }),
  )
  return { status: "success", mustChangePassword: user.mustChangePassword }
}

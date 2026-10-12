import "server-only"

import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { APIError } from "better-auth/api"
import { nextCookies } from "better-auth/next-js"
import { username } from "better-auth/plugins"
import { eq } from "drizzle-orm"

import { db } from "@/lib/db"
import { accounts, sessions, users, verifications } from "@/lib/db/schema"

import { USERNAME_PATTERN } from "./credentials"

/**
 * Blocks session creation for deactivated or locked users (FR-IAM-002, FR-IAM-003).
 * Throwing `APIError` makes Better Auth reject the sign-in with a 403.
 */
async function assertCanSignIn(userId: string) {
  const [user] = await db
    .select({ deactivatedAt: users.deactivatedAt, lockedUntil: users.lockedUntil })
    .from(users)
    .where(eq(users.id, userId))
  if (!user || user.deactivatedAt) {
    throw new APIError("FORBIDDEN", { message: "This account is deactivated." })
  }
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    throw new APIError("FORBIDDEN", { message: "This account is temporarily locked." })
  }
}

/**
 * The Better Auth instance: username/password sign-in against our `users` table,
 * public sign-up disabled. Server-only; use `@/lib/auth/session` helpers in app code.
 */
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { user: users, session: sessions, account: accounts, verification: verifications },
  }),
  user: { fields: { name: "fullName" } },
  session: {
    // Signed session cookie, so page loads skip the session DB round trip. Revocation still
    // takes effect at once: deactivation and must-change-password are read from the
    // tag-invalidated `getUserAccess`, and sensitive actions use `getVerifiedUserId()`.
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },
  // Accounts are provisioned by administrators only (FR-IAM-001).
  emailAndPassword: { enabled: true, disableSignUp: true },
  advanced: { database: { generateId: "uuid" } },
  databaseHooks: {
    // Backstop for any sign-in path, including direct calls to /api/auth/*.
    session: { create: { before: async (session) => assertCanSignIn(session.userId) } },
  },
  plugins: [username({
      maxUsernameLength: 50,
      // Same rule as the admin user form; Better Auth's default rejects dashes.
      usernameValidator: (value) => USERNAME_PATTERN.test(value),
    }), nextCookies()],
})

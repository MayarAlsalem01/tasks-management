import "server-only"

import { and, eq } from "drizzle-orm"

import { auth } from "@/lib/auth/server"
import { CREDENTIAL_PROVIDER } from "@/lib/auth/credentials"
import { db } from "@/lib/db"
import { accounts, users } from "@/lib/db/schema"
import { AppError } from "@/lib/errors"

/**
 * Replaces the signed-in user's own password and clears `must_change_password`.
 * The current session stays valid.
 * @throws {AppError} `VALIDATION` when the new password equals the current one.
 */
export async function changeOwnPassword(userId: string, password: string) {
  const ctx = await auth.$context
  const [account] = await db
    .select({ hash: accounts.password })
    .from(accounts)
    .where(and(eq(accounts.userId, userId), eq(accounts.providerId, CREDENTIAL_PROVIDER)))

  if (account?.hash && (await ctx.password.verify({ hash: account.hash, password }))) {
    throw new AppError("VALIDATION", "Choose a password different from your current one.")
  }

  await ctx.internalAdapter.updatePassword(userId, await ctx.password.hash(password))
  await db.update(users).set({ mustChangePassword: false }).where(eq(users.id, userId))
}

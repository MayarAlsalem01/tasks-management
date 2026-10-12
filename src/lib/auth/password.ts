import "server-only"

import { auth } from "./server"

/** Hashes a password the same way Better Auth verifies it at sign-in. */
export async function hashPassword(plain: string) {
  const ctx = await auth.$context
  return ctx.password.hash(plain)
}

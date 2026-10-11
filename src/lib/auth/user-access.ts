import "server-only"

import { eq } from "drizzle-orm"
import { cacheLife, cacheTag } from "next/cache"

import { CacheProfile, CacheTag } from "@/lib/cache-tags"
import { db } from "@/lib/db"
import { userRoles, users } from "@/lib/db/schema"

import type { Role } from "./roles"

export type UserAccess = { roles: Role[]; deactivated: boolean; mustChangePassword: boolean }

/**
 * A user's roles and account flags, cached under `CacheTag.Users`. Every action that changes
 * roles, deactivation or the must-change flag invalidates that tag, so session checks stay
 * correct without a database round trip per navigation. `null` when the user doesn't exist.
 */
export async function getUserAccess(userId: string): Promise<UserAccess | null> {
  "use cache"
  cacheTag(CacheTag.Users)
  cacheLife(CacheProfile.Reference)

  const [[row], roleRows] = await Promise.all([
    db
      .select({ mustChangePassword: users.mustChangePassword, deactivatedAt: users.deactivatedAt })
      .from(users)
      .where(eq(users.id, userId)),
    db.select({ role: userRoles.role }).from(userRoles).where(eq(userRoles.userId, userId)),
  ])
  if (!row) return null
  return {
    roles: roleRows.map((r) => r.role),
    deactivated: row.deactivatedAt !== null,
    mustChangePassword: row.mustChangePassword,
  }
}

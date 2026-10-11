import "server-only"

import { updateTag } from "next/cache"

import { CacheTag } from "@/lib/cache-tags"

/**
 * Refreshes cached user data after a sign-in (last active) or a password change (clears
 * the must-change flag read by every session check). Server Actions only.
 */
export function revalidateUserAccess() {
  updateTag(CacheTag.Users)
}

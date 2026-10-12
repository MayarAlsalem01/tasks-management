import "server-only"

import { updateTag } from "next/cache"

import { CacheTag } from "@/lib/cache-tags"

/**
 * Invalidates user data after an admin change. Memberships and team lists live under the
 * projects tag, so it's refreshed too. Server Actions only.
 */
export function revalidateUsers() {
  updateTag(CacheTag.Users)
  updateTag(CacheTag.Projects)
}

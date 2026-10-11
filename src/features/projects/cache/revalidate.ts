import "server-only"

import { updateTag } from "next/cache"

import { CacheTag } from "@/lib/cache-tags"

/**
 * Invalidates everything derived from project data (switchers, trees, admin tables, the
 * users table's project chips). Server Actions only: `updateTag` throws elsewhere.
 */
export function revalidateProjects() {
  updateTag(CacheTag.Projects)
}

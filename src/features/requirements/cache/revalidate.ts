import "server-only"

import { updateTag } from "next/cache"

import { revalidateNotifications } from "@/features/notifications/server"
import { CacheTag } from "@/lib/cache-tags"

/**
 * Invalidates requirement data after a write: tables, drawers, sidebar trees and counts, and
 * My Tasks all carry the requirements tag. `notified` users also get their notification
 * feeds refreshed. Server Actions only.
 */
export function revalidateRequirements(notified: readonly string[] = []) {
  updateTag(CacheTag.Requirements)
  for (const userId of notified) revalidateNotifications(userId)
}

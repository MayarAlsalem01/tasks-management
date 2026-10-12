import "server-only"

import { updateTag } from "next/cache"

import { notificationsTag } from "@/lib/cache-tags"

/** Refreshes one user's notification feed and badge. Server Actions only. */
export function revalidateNotifications(userId: string) {
  updateTag(notificationsTag(userId))
}

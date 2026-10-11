import "server-only"

import { cacheLife, cacheTag } from "next/cache"

import { CacheProfile, notificationsTag } from "@/lib/cache-tags"

import { countUnreadNotifications, listNotifications } from "../actions/notification-queries"

/** The user's latest notifications (newest first), cached per user. */
export async function getNotifications(userId: string, limit = 20) {
  "use cache"
  cacheTag(notificationsTag(userId))
  cacheLife(CacheProfile.Feed)
  return listNotifications(userId, limit)
}

export async function getUnreadNotificationCount(userId: string) {
  "use cache"
  cacheTag(notificationsTag(userId))
  cacheLife(CacheProfile.Feed)
  return countUnreadNotifications(userId)
}

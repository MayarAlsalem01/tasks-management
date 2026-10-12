import "server-only"

import { cacheLife, cacheTag } from "next/cache"

import { CacheProfile, notificationsTag } from "@/lib/cache-tags"

import { countUnreadNotifications, listNotifications } from "../actions/notification-queries"
import type { NotificationFeed } from "../types/notification"

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

/** The feed a bell or notifications page starts from: latest `limit` items plus the unread total. */
export async function getNotificationFeed(userId: string, limit: number): Promise<NotificationFeed> {
  const [items, unreadCount] = await Promise.all([getNotifications(userId, limit), getUnreadNotificationCount(userId)])
  return { items, unreadCount }
}

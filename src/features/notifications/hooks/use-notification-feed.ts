"use client"

import { queryOptions, useQuery } from "@tanstack/react-query"

import { getNotificationFeedAction } from "../actions/notification-actions"
import { notificationKeys } from "../cache/query-keys"
import type { NotificationFeed } from "../types/notification"

/** Query options for one feed size, shared by the live hook and the Pusher listener. */
export function notificationFeedQuery(limit: number) {
  return queryOptions({
    queryKey: notificationKeys.feed(limit),
    queryFn: async () => {
      const result = await getNotificationFeedAction(limit)
      if (result.status === "error") throw new Error(result.message)
      return { items: result.items, unreadCount: result.unreadCount } satisfies NotificationFeed
    },
  })
}

/**
 * The signed-in user's notification feed, seeded with the server-rendered `initial` data and
 * kept live by `NotificationsLive`, which invalidates it when Pusher events arrive.
 */
export function useNotificationFeed(initial: NotificationFeed, limit: number) {
  return useQuery({ ...notificationFeedQuery(limit), initialData: initial }).data
}

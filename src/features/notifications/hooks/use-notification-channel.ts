"use client"

import { useQueryClient } from "@tanstack/react-query"
import { useEffect, useEffectEvent } from "react"

import { logError } from "@/lib/errors"
import { getPusherClient } from "@/lib/pusher/client"
import { PusherEvent, userChannel } from "@/lib/pusher/channels"

import { notificationKeys } from "../cache/query-keys"
import { NotificationFeedLimit, type NotificationItem } from "../types/notification"
import { notificationFeedQuery } from "./use-notification-feed"

/**
 * Subscribes to the user's private Pusher channel (FR-NOT-001) and keeps every cached feed
 * live: new notifications refetch the feeds and call `onNew` with the newest unread one;
 * reads in another tab and reconnects after an outage refetch them too.
 */
export function useNotificationChannel(userId: string, onNew: (item: NotificationItem) => void) {
  const queryClient = useQueryClient()
  const notifyNew = useEffectEvent(onNew)

  useEffect(() => {
    const pusher = getPusherClient()
    const name = userChannel(userId)
    const channel = pusher.subscribe(name)
    const refresh = () => queryClient.invalidateQueries({ queryKey: notificationKeys.all })

    const onCreated = async () => {
      await refresh()
      const feed = await queryClient.fetchQuery(notificationFeedQuery(NotificationFeedLimit.Popover))
      const newest = feed.items.find((n) => !n.read)
      if (newest) notifyNew(newest)
    }
    // Events sent while the socket was down are lost, so catch up once it's back.
    const onStateChange = ({ previous, current }: { previous: string; current: string }) => {
      if (previous === "unavailable" && current === "connected") void refresh()
    }
    const onSubscriptionError = (error: unknown) => logError(error, "notifications.subscribe")

    channel.bind(PusherEvent.NotificationCreated, onCreated)
    channel.bind(PusherEvent.NotificationsRead, refresh)
    channel.bind("pusher:subscription_error", onSubscriptionError)
    pusher.connection.bind("state_change", onStateChange)
    return () => {
      channel.unbind_all()
      pusher.connection.unbind("state_change", onStateChange)
      pusher.unsubscribe(name)
    }
  }, [userId, queryClient])
}

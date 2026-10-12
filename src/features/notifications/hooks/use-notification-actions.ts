"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { markAllNotificationsReadAction, markNotificationReadAction } from "../actions/notification-actions"
import { notificationKeys } from "../cache/query-keys"
import type { NotificationFeed, NotificationItem } from "../types/notification"
import { markFeedRead } from "../utils/feed"

/**
 * Opening a notification (mark it read, then follow its link) and "Mark all as read". Both
 * update every cached feed optimistically and roll back with a toast if the action fails.
 */
export function useNotificationActions(onNavigate?: () => void) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const markRead = useMutation({
    mutationFn: async (id?: string) => {
      const result = id ? await markNotificationReadAction(id) : await markAllNotificationsReadAction()
      if (result.status === "error") throw new Error(result.message)
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.all })
      const previous = queryClient.getQueriesData<NotificationFeed>({ queryKey: notificationKeys.all })
      queryClient.setQueriesData<NotificationFeed>({ queryKey: notificationKeys.all }, (feed) => feed && markFeedRead(feed, id))
      return { previous }
    },
    onError: (error, _id, context) => {
      for (const [key, feed] of context?.previous ?? []) queryClient.setQueryData(key, feed)
      toast.error(error.message)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
  })

  const open = (item: NotificationItem) => {
    if (!item.read) markRead.mutate(item.id)
    if (item.linkUrl) {
      onNavigate?.()
      router.push(item.linkUrl)
    }
  }

  return { open, markAll: () => markRead.mutate(undefined), pending: markRead.isPending }
}

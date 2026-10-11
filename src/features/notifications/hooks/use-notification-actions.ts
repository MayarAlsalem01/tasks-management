"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { toast } from "sonner"

import { markAllNotificationsReadAction, markNotificationReadAction } from "../actions/notification-actions"
import type { NotificationItem } from "../types/notification"

/** Opening a notification (mark read, then follow its link) and "Mark all as read". */
export function useNotificationActions(onNavigate?: () => void) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const open = (item: NotificationItem) =>
    startTransition(async () => {
      if (!item.read) {
        const result = await markNotificationReadAction(item.id)
        if (result.status === "error") toast.error(result.message)
      }
      if (item.linkUrl) {
        onNavigate?.()
        router.push(item.linkUrl)
      }
    })

  const markAll = () =>
    startTransition(async () => {
      const result = await markAllNotificationsReadAction()
      if (result.status === "error") toast.error(result.message)
    })

  return { open, markAll, pending }
}

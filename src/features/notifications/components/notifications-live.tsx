"use client"

import { toast } from "sonner"

import { playChime } from "@/lib/chime"

import { useNotificationActions } from "../hooks/use-notification-actions"
import { useNotificationChannel } from "../hooks/use-notification-channel"
import { notificationHeadline } from "../utils/feed"

/**
 * Keeps the bell, badges and notifications page live over Pusher. Each new notification
 * plays a chime and shows a toast with an "Open" action. Renders nothing; mount it once per signed-in layout.
 */
export function NotificationsLive({ userId }: { userId: string }) {
  const { open } = useNotificationActions()
  useNotificationChannel(userId, (item) => {
    playChime()
    toast(notificationHeadline(item), {
      description: item.message || undefined,
      action: item.linkUrl ? { label: "Open", onClick: () => open(item) } : undefined,
    })
  })
  return null
}

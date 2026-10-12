import type { notificationTypeEnum } from "@/lib/db/schema"

/** Notification kinds (FR-NOT-001); mirrors the `notification_type` DB enum. */
export const NotificationType = {
  Assigned: "ASSIGNED",
  QaFailed: "QA_FAILED",
  AcsDevComplete: "ACS_DEV_COMPLETE",
} as const satisfies Record<string, (typeof notificationTypeEnum.enumValues)[number]>
export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType]

export type NotificationItem = {
  id: string
  type: NotificationType
  title: string
  message: string
  linkUrl: string | null
  actor: { id: string; fullName: string } | null
  frCode: string | null
  projectCode: string | null
  createdAt: Date
  read: boolean
}

/** What the bell and the notifications page render: a page of items plus the unread total. */
export type NotificationFeed = { items: NotificationItem[]; unreadCount: number }

/** Feed sizes: the header popover and the full notifications page. */
export const NotificationFeedLimit = { Popover: 20, Page: 100 } as const

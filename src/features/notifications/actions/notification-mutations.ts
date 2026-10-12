import "server-only"

import type { DbExecutor } from "@/lib/db"
import { notifications } from "@/lib/db/schema"

import type { NotificationType } from "../types/notification"

export type NewNotification = {
  type: NotificationType
  title: string
  message: string
  linkUrl?: string
  projectId?: string
  frId?: string
  actorId: string
}

/**
 * Sends one notification to each recipient (FR-NOT-001), inside the caller's transaction so
 * it only exists if the change it describes commits. The actor never notifies themself.
 * Returns the recipients actually notified, so the caller can refresh their feeds
 * (`revalidateNotifications`) after the transaction.
 */
export async function notifyUsers(tx: DbExecutor, recipientIds: string[], notification: NewNotification) {
  const recipients = [...new Set(recipientIds)].filter((id) => id !== notification.actorId)
  if (!recipients.length) return []
  await tx.insert(notifications).values(recipients.map((userId) => ({ userId, ...notification })))
  return recipients
}

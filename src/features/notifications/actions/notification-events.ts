import "server-only"

import { PusherEvent, userChannel } from "@/lib/pusher/channels"
import { publish } from "@/lib/pusher/server"

/**
 * Tells each recipient's open tabs that they have new notifications (FR-NOT-001). Call it
 * after the transaction that stored them commits. The event carries no notification text:
 * clients refetch their feed through their own session.
 */
export function publishNotifications(recipientIds: readonly string[]) {
  publish(recipientIds.map(userChannel), PusherEvent.NotificationCreated)
}

/** Tells the user's other tabs and devices that they marked notifications read. */
export function publishNotificationsRead(userId: string) {
  publish([userChannel(userId)], PusherEvent.NotificationsRead)
}

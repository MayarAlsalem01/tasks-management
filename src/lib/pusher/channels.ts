/** Pusher channel names and event names shared by the server publisher and browser clients. */

/** A user's private channel; only that user can subscribe (see `/api/pusher/auth`). */
export function userChannel(userId: string) {
  return `private-user-${userId}`
}

export const PusherEvent = {
  /** New notifications were stored for the channel's user (FR-NOT-001). */
  NotificationCreated: "notification.created",
  /** The channel's user marked notifications read, so other tabs refresh their badge. */
  NotificationsRead: "notifications.read",
} as const
export type PusherEvent = (typeof PusherEvent)[keyof typeof PusherEvent]

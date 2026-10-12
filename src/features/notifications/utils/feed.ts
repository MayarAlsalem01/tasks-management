import type { NotificationFeed, NotificationItem } from "../types/notification"

/** The feed with one notification (`id`) or all of them marked read, for optimistic updates. */
export function markFeedRead(feed: NotificationFeed, id?: string): NotificationFeed {
  const isTarget = (n: NotificationItem) => !n.read && (id === undefined || n.id === id)
  const changed = feed.items.filter(isTarget).length
  return {
    items: feed.items.map((n) => (isTarget(n) ? { ...n, read: true } : n)),
    unreadCount: id === undefined ? 0 : Math.max(0, feed.unreadCount - changed),
  }
}

/** One-line text for a notification toast, e.g. "Dana Lee assigned you as developer on FR-012". */
export function notificationHeadline(item: NotificationItem) {
  return item.actor ? `${item.actor.fullName} ${item.title}` : item.title
}

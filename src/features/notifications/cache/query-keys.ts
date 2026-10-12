/** React Query keys for notification data fetched on the client. */
export const notificationKeys = {
  all: ["notifications"] as const,
  feed: (limit: number) => [...notificationKeys.all, "feed", limit] as const,
}

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

/**
 * Short relative time for activity lists: "Now", "5m ago", "3h ago", "Yesterday", "4d ago",
 * then a date like "Sep 30" (with the year if it isn't the current one).
 */
export function relativeTime(date: Date, now: Date = new Date()) {
  const diff = now.getTime() - date.getTime()
  if (diff < MINUTE) return "Now"
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)}m ago`
  if (diff < DAY) return `${Math.floor(diff / HOUR)}h ago`
  if (diff < 2 * DAY) return "Yesterday"
  if (diff < 7 * DAY) return `${Math.floor(diff / DAY)}d ago`
  const sameYear = date.getFullYear() === now.getFullYear()
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  })
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

/** `YYYY-MM-DD` → "Oct 24" (or "Oct 24, 2026" with `withYear`). Pure string math: no time zones. */
export function formatIsoDate(iso: string, { withYear = false } = {}) {
  const [year, month, day] = iso.split("-").map(Number)
  return `${MONTHS[month - 1]} ${day}${withYear ? `, ${year}` : ""}`
}

/** Today as `YYYY-MM-DD` in the viewer's time zone. */
export function todayIso(now = new Date()) {
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

/** Days past the target date for unfinished work, or 0 when not overdue. */
export function overdueDays(targetDate: string | null, isDone: boolean, today: string) {
  if (!targetDate || isDone || targetDate >= today) return 0
  return Math.round((Date.parse(today) - Date.parse(targetDate)) / 86_400_000)
}

import { relativeTime } from "@/lib/format"

import { AttentionKind, type AttentionItem, type AttentionList, type DashboardHistory, type StatusEvent } from "../types/dashboard"
import type { FrRow } from "../types/requirement"
import { DEV_STATUS_LABEL, DevStatus, QaStatus } from "../types/status"
import { formatIsoDate } from "./dates"

const DAY = 86_400_000
/** How far ahead the Target dates list looks. */
export const TARGET_HORIZON_DAYS = 14
/** Target dates this close are flagged amber. */
const TARGET_SOON_DAYS = 3

type Context = { history: DashboardHistory; now: Date; today: string }

/** The active developer who owns the fix, else whoever is still assigned. */
const developer = (row: FrRow) => row.developers.find((p) => !p.deactivated) ?? row.developers[0] ?? null

const item = (row: FrRow, meta: string, chip: AttentionItem["chip"]): AttentionItem => ({
  id: row.id,
  code: row.code,
  title: row.title,
  person: developer(row),
  meta,
  chip,
})

/** The FR's most recent status change matching `pick`. */
function lastEvent(events: StatusEvent[], frId: string, pick: (e: StatusEvent) => boolean) {
  return events.findLast((e) => e.frId === frId && pick(e))
}

function blocked(rows: FrRow[], { history, now }: Context) {
  return rows
    .filter((r) => r.dev === DevStatus.Blocked)
    .map((row) => {
      const since = lastEvent(history.events, row.id, (e) => e.dev?.to === DevStatus.Blocked)?.at
      const days = since ? Math.floor((now.getTime() - since.getTime()) / DAY) : null
      const label = days === null ? "Blocked" : days === 0 ? "Blocked today" : `${days}d blocked`
      return { row, days: days ?? 0, item: item(row, row.openIssues?.split("\n")[0] || "No blocker noted", { label, tone: "danger" as const }) }
    })
    .toSorted((a, b) => b.days - a.days)
    .map((entry) => entry.item)
}

function qaFailed(rows: FrRow[], { history, now }: Context) {
  return rows
    .filter((r) => r.qa === QaStatus.Failed)
    .map((row) => {
      const defect = history.defects.find((d) => d.frId === row.id)
      const failed = lastEvent(history.events, row.id, (e) => e.qa?.to === QaStatus.Failed)
      const meta = defect
        ? `${defect.acCode} defect by ${defect.author} · ${relativeTime(defect.at, now)}`
        : failed ? `Failed by ${failed.actor ?? "QA"} · ${relativeTime(failed.at, now)}` : "Failed QA"
      const hasFixer = row.developers.some((p) => !p.deactivated)
      return item(row, meta, hasFixer ? { label: "Awaiting fix", tone: "neutral" } : { label: "Unassigned fix", tone: "warning" })
    })
}

function overrides(rows: FrRow[], { history, now }: Context) {
  return rows.flatMap((row) => {
    const last = row.dev === DevStatus.Done ? lastEvent(history.events, row.id, (e) => e.dev !== null) : undefined
    if (!last?.override) return []
    const open = row.acs.filter((ac) => !ac.devDone).length
    const meta = [`${last.actor ?? "An admin"} overrode ${relativeTime(last.at, now)}`, last.reason].filter(Boolean).join(" · ")
    return [item(row, meta, open ? { label: `${open} ${open === 1 ? "AC" : "ACs"} open`, tone: "warning" } : { label: "All ACs done", tone: "neutral" })]
  })
}

function targetDates(rows: FrRow[], { today }: Context) {
  return rows
    .filter((r) => r.targetDate && !(r.dev === DevStatus.Done && r.qa === QaStatus.Passed))
    .map((row) => ({ row, days: Math.round((Date.parse(row.targetDate!) - Date.parse(today)) / DAY) }))
    .filter(({ days }) => days <= TARGET_HORIZON_DAYS)
    .toSorted((a, b) => a.days - b.days)
    .map(({ row, days }) => {
      const when = days < 0 ? `${-days}d overdue` : days === 0 ? "today" : `in ${days}d`
      const tone = days < 0 ? "danger" : days <= TARGET_SOON_DAYS ? "warning" : "neutral"
      const status = row.dev === DevStatus.Done ? "Done, awaiting QA" : DEV_STATUS_LABEL[row.dev]
      return item(row, status, { label: `${formatIsoDate(row.targetDate!)} · ${when}`, tone })
    })
}

/**
 * The dashboard's "needs attention" lists over active FRs: blocked (longest first), QA
 * failed, marked Done by an Admin/PO override (FR-WKF-001), and target dates that are
 * overdue or due within two weeks (soonest first). `today` is `YYYY-MM-DD`.
 */
export function attentionLists(rows: FrRow[], history: DashboardHistory, now: Date, today: string): AttentionList[] {
  const active = rows.filter((r) => !r.archived)
  const context = { history, now, today }
  return [
    { kind: AttentionKind.Blocked, items: blocked(active, context) },
    { kind: AttentionKind.QaFailed, items: qaFailed(active, context) },
    { kind: AttentionKind.Override, items: overrides(active, context) },
    { kind: AttentionKind.TargetDates, items: targetDates(active, context) },
  ]
}

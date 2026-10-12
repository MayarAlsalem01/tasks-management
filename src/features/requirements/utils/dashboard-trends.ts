import { percent } from "@/lib/progress"

import type { DashboardHistory, DashboardMetric, StatusEvent } from "../types/dashboard"
import type { FrRow } from "../types/requirement"
import { DevStatus, QaStatus } from "../types/status"

const DAY = 86_400_000
const SAMPLES = 8

type Snapshot = { total: number; done: number; passed: number }
type State = Map<string, { dev: DevStatus; qa: QaStatus }>

/** Evenly spaced sample times from `days` ago to `now`, newest first. */
function sampleTimes(days: number, now: Date) {
  const step = (days * DAY) / (SAMPLES - 1)
  return Array.from({ length: SAMPLES }, (_, i) => now.getTime() - i * step)
}

function undo(state: State, event: StatusEvent) {
  const current = state.get(event.frId)
  if (!current) return
  if (event.dev) current.dev = event.dev.from
  if (event.qa) current.qa = event.qa.from
}

/**
 * Requirement count and Done / Passed counts at evenly spaced points over the last `days`,
 * oldest first. Starts from today's statuses and undoes audited changes backwards in time,
 * so it only needs the audit log, not stored snapshots. An FR counts while it existed and
 * wasn't archived at that moment.
 */
export function replaySnapshots(rows: FrRow[], history: DashboardHistory, days: number, now: Date): Snapshot[] {
  const ids = new Set(rows.map((r) => r.id))
  const state: State = new Map(rows.map((r) => [r.id, { dev: r.dev, qa: r.qa }]))
  const lifespans = history.lifespans.filter((l) => ids.has(l.id))
  const events = history.events.filter((e) => ids.has(e.frId)).toReversed()
  const snapshots: Snapshot[] = []
  let next = 0
  for (const time of sampleTimes(days, now)) {
    while (next < events.length && events[next].at.getTime() > time) undo(state, events[next++])
    const alive = lifespans.filter((l) => l.createdAt.getTime() <= time && !(l.deletedAt && l.deletedAt.getTime() <= time))
    snapshots.push({
      total: alive.length,
      done: alive.filter((l) => state.get(l.id)?.dev === DevStatus.Done).length,
      passed: alive.filter((l) => state.get(l.id)?.qa === QaStatus.Passed).length,
    })
  }
  return snapshots.toReversed()
}

const signed = (n: number) => (n > 0 ? `+${n}` : n < 0 ? `−${-n}` : "±0")

function metric(base: Omit<DashboardMetric, "delta" | "deltaLabel">, unit = ""): DashboardMetric {
  const delta = base.series.at(-1)! - base.series[0]
  return { ...base, delta, deltaLabel: `${signed(delta)}${unit}` }
}

const frs = (n: number) => `${n} ${n === 1 ? "FR" : "FRs"}`

/**
 * The three headline metrics (FR-UI-003): requirement count, dev completion (% Done) and QA
 * pass rate (% Passed) of active FRs, each with its trend over the window.
 */
export function buildMetrics(rows: FrRow[], history: DashboardHistory, days: number, now: Date): DashboardMetric[] {
  const active = rows.filter((r) => !r.archived)
  const done = active.filter((r) => r.dev === DevStatus.Done).length
  const passed = active.filter((r) => r.qa === QaStatus.Passed).length
  const since = now.getTime() - days * DAY
  const activeIds = new Set(active.map((r) => r.id))
  const added = history.lifespans.filter((l) => activeIds.has(l.id) && l.createdAt.getTime() >= since).length
  const snapshots = replaySnapshots(rows, history, days, now)

  return [
    metric({
      label: "Total requirements",
      value: String(active.length),
      sub: `${rows.length - active.length} archived · ${added} added this period`,
      tone: "neutral",
      series: snapshots.map((s) => s.total),
    }),
    metric({
      label: "Dev completion",
      value: `${percent(done, active.length)}%`,
      sub: `${done} of ${frs(active.length)} Done`,
      tone: "dev",
      series: snapshots.map((s) => percent(s.done, s.total)),
    }, " pts"),
    metric({
      label: "QA pass rate",
      value: `${percent(passed, active.length)}%`,
      sub: `${passed} of ${frs(active.length)} Passed`,
      tone: "qa",
      series: snapshots.map((s) => percent(s.passed, s.total)),
    }, " pts"),
  ]
}

/** SVG paths for a sparkline: the line, the filled area under it and its last point. */
export function sparkline(series: number[], width: number, height: number, pad = 3) {
  const max = Math.max(...series)
  const min = Math.min(...series)
  const span = max - min || 1
  const points = series.map((v, i) => [
    pad + (i * (width - 2 * pad)) / Math.max(series.length - 1, 1),
    height - pad - ((v - min) / span) * (height - 2 * pad),
  ])
  const line = points.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ")
  const [endX, endY] = points.at(-1)!
  return { line, area: `${line} L${endX.toFixed(1)} ${height} L${points[0][0].toFixed(1)} ${height} Z`, end: { x: endX, y: endY } }
}

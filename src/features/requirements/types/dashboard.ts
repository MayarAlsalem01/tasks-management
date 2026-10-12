import type { Person } from "./requirement"
import type { DevStatus, QaStatus } from "./status"

/** Dashboard trend window in days (`SearchParam.Trend`). */
export const TrendWindow = { Week: "7", Month: "30" } as const
export type TrendWindow = (typeof TrendWindow)[keyof typeof TrendWindow]

export const TREND_WINDOW_LABEL: Record<TrendWindow, string> = { "7": "7 days", "30": "30 days" }

/** When an FR was created and archived, for replaying the requirement count. */
export type FrLifespan = { id: string; createdAt: Date; deletedAt: Date | null }

/** One audited Dev and/or QA status change of an FR. */
export type StatusEvent = {
  frId: string
  at: Date
  actor: string | null
  /** Admin/PO marked the FR Done with pending ACs (FR-WKF-001). */
  override: boolean
  reason: string | null
  dev: { from: DevStatus; to: DevStatus } | null
  qa: { from: QaStatus; to: QaStatus } | null
}

/** The latest defect reported on a QA-failed FR. */
export type LatestDefect = { frId: string; acCode: string; author: string; at: Date }

/** Everything the dashboard needs beyond the FR rows: lifespans, status history, defects. */
export type DashboardHistory = {
  lifespans: FrLifespan[]
  /** Oldest first. */
  events: StatusEvent[]
  defects: LatestDefect[]
}

export type MetricTone = "neutral" | "dev" | "qa"

/** A headline number with its trend over the window. */
export type DashboardMetric = {
  label: string
  value: string
  sub: string
  tone: MetricTone
  series: number[]
  /** Last minus first point of `series`. */
  delta: number
  deltaLabel: string
}

/** AC completion of one backbone activity (FR-UI-003 rollup). */
export type ActivityProgress = {
  id: string
  name: string
  frs: number
  acs: number
  /** Percent of ACs dev-done / QA-passed. */
  dev: number
  qa: number
}

export type StatusCount<S extends string> = { status: S; count: number }

export type StatusDistribution = {
  total: number
  dev: StatusCount<DevStatus>[]
  qa: StatusCount<QaStatus>[]
}

export type ChipTone = "danger" | "warning" | "neutral"

/** An FR in one of the "needs attention" lists. */
export type AttentionItem = {
  id: string
  code: string
  title: string
  person: Person | null
  meta: string
  chip: { label: string; tone: ChipTone }
}

export const AttentionKind = {
  Blocked: "blocked",
  QaFailed: "qa-failed",
  Override: "override",
  TargetDates: "target-dates",
} as const
export type AttentionKind = (typeof AttentionKind)[keyof typeof AttentionKind]

export type AttentionList = { kind: AttentionKind; items: AttentionItem[] }

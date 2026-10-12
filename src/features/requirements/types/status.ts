import type {
  devStatusEnum,
  priorityEnum,
  prStateEnum,
  qaStatusEnum,
  specStatusEnum,
} from "@/lib/db/schema"

// Value objects mirror the DB enums (the source of truth); `satisfies` keeps them in sync.

export type DevStatus = (typeof devStatusEnum.enumValues)[number]
export const DevStatus = {
  NotStarted: "not-started",
  InProgress: "in-progress",
  Blocked: "blocked",
  Done: "done",
} as const satisfies Record<string, DevStatus>

export type QaStatus = (typeof qaStatusEnum.enumValues)[number]
export const QaStatus = {
  NotTested: "not-tested",
  Passed: "passed",
  Failed: "failed",
} as const satisfies Record<string, QaStatus>

export type SpecStatus = (typeof specStatusEnum.enumValues)[number]
export const SpecStatus = {
  Draft: "draft",
  PendingReview: "pending-review",
  Approved: "approved",
} as const satisfies Record<string, SpecStatus>

export type Priority = (typeof priorityEnum.enumValues)[number]
export const Priority = {
  Critical: "critical",
  High: "high",
  Medium: "medium",
  Low: "low",
} as const satisfies Record<string, Priority>

export type PrState = (typeof prStateEnum.enumValues)[number]
export const PrState = {
  Open: "open",
  Merged: "merged",
  Draft: "draft",
  Closed: "closed",
} as const satisfies Record<string, PrState>

/** Display order for menus, filters and groups. */
export const DEV_STATUSES = Object.values(DevStatus)
export const QA_STATUSES = Object.values(QaStatus)
export const SPEC_STATUSES = Object.values(SpecStatus)
export const PRIORITIES = Object.values(Priority)

export const DEV_STATUS_LABEL: Record<DevStatus, string> = {
  "not-started": "Not started",
  "in-progress": "In progress",
  blocked: "Blocked",
  done: "Done",
}

export const QA_STATUS_LABEL: Record<QaStatus, string> = {
  "not-tested": "Not tested",
  passed: "Passed",
  failed: "Failed",
}

export const SPEC_STATUS_LABEL: Record<SpecStatus, string> = {
  draft: "Draft",
  "pending-review": "Pending review",
  approved: "Approved",
}

export const PRIORITY_LABEL: Record<Priority, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
}

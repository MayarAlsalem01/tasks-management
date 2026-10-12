import { AuditAction } from "@/lib/audit"

import type { AuditChange } from "../types/requirement"
import { DEV_STATUS_LABEL, PRIORITY_LABEL, QA_STATUS_LABEL, SPEC_STATUS_LABEL } from "../types/status"
import { formatIsoDate } from "./dates"

/** Keys that requirement services write into audit `old_values` / `new_values`. */
export const AuditField = {
  Title: "title",
  Description: "description",
  Priority: "priority",
  Spec: "specStatus",
  Dev: "devStatus",
  Qa: "qaStatus",
  TargetDate: "targetDate",
  OpenIssues: "openIssues",
  Notes: "notes",
  Developers: "developers",
  QaEngineers: "qaEngineers",
  PullRequest: "pullRequest",
  DevDone: "devDone",
  QaPassed: "qaPassed",
  Criteria: "criteria",
  Position: "position",
  Defect: "defect",
  // Context, not changes: shown as a label prefix, the override reason, etc.
  Code: "code",
  Reason: "reason",
  MarkAllAcs: "markAllAcs",
} as const

// Runs on the server only (`@/lib/audit` is server-only); the drawer receives formatted lines.
const CONTEXT_KEYS: string[] = [AuditField.Code, AuditField.Reason, AuditField.MarkAllAcs]

const FIELD_LABEL: Record<string, string> = {
  [AuditField.Title]: "Requirement",
  [AuditField.Description]: "Description",
  [AuditField.Priority]: "Priority",
  [AuditField.Spec]: "Spec status",
  [AuditField.Dev]: "Dev status",
  [AuditField.Qa]: "QA status",
  [AuditField.TargetDate]: "Target date",
  [AuditField.OpenIssues]: "Open issues",
  [AuditField.Notes]: "Notes",
  [AuditField.Developers]: "Developer",
  [AuditField.QaEngineers]: "QA engineer",
  [AuditField.PullRequest]: "PR link",
  [AuditField.DevDone]: "Dev done",
  [AuditField.QaPassed]: "QA passed",
  [AuditField.Criteria]: "Text",
  [AuditField.Position]: "Order",
  [AuditField.Defect]: "Defect",
}

const VALUE_LABEL: Record<string, Record<string, string>> = {
  [AuditField.Priority]: PRIORITY_LABEL,
  [AuditField.Spec]: SPEC_STATUS_LABEL,
  [AuditField.Dev]: DEV_STATUS_LABEL,
  [AuditField.Qa]: QA_STATUS_LABEL,
}

const EMPTY = "—"

function formatValue(key: string, value: unknown): string {
  if (value === null || value === undefined || value === "") return EMPTY
  if (Array.isArray(value)) return value.length ? value.join(", ") : "Unassigned"
  if (typeof value === "boolean") return value ? "Yes" : "No"
  const text = String(value)
  if (key === AuditField.TargetDate) return formatIsoDate(text, { withYear: true })
  const label = VALUE_LABEL[key]?.[text]
  if (label) return label
  return text.length > 80 ? `${text.slice(0, 79)}…` : text
}

type Values = Record<string, unknown> | null

/**
 * Turns one audit row written by the requirement services into display lines ("Dev status:
 * In progress → Done"). AC rows are prefixed with the AC code. Unknown keys still render,
 * with the raw key as the label, so older entries never disappear from the history.
 */
export function describeAuditChanges(action: string, oldValues: Values, newValues: Values, entityLabel: string): AuditChange[] {
  if (action === AuditAction.Create) return [{ field: entityLabel, from: EMPTY, to: "Created" }]
  if (action === AuditAction.Archive) return [{ field: entityLabel, from: "Active", to: "Archived" }]
  if (action === AuditAction.Restore) return [{ field: entityLabel, from: "Archived", to: "Active" }]
  const keys = [...new Set([...Object.keys(oldValues ?? {}), ...Object.keys(newValues ?? {})])].filter((k) => !CONTEXT_KEYS.includes(k))
  const prefix = entityLabel.startsWith("FR") ? "" : `${entityLabel} `
  return keys.map((key) => ({
    field: `${prefix}${FIELD_LABEL[key] ?? key}`,
    from: formatValue(key, oldValues?.[key]),
    to: formatValue(key, newValues?.[key]),
  }))
}

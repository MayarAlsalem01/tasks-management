import "server-only"

import type { DbExecutor } from "@/lib/db"
import { auditLogs } from "@/lib/db/schema"

/** Audit-log entity names (FR-AUD-001). */
export const AuditEntity = {
  User: "user",
  Project: "project",
  FunctionalRequirement: "functional_requirement",
  AcceptanceCriterion: "acceptance_criterion",
  Activity: "activity",
  Step: "step",
} as const
export type AuditEntity = (typeof AuditEntity)[keyof typeof AuditEntity]

/** Audit-log action codes. `OverrideDevDone` is required by FR-WKF-001. */
export const AuditAction = {
  Create: "CREATE",
  Update: "UPDATE",
  Deactivate: "DEACTIVATE",
  Reactivate: "REACTIVATE",
  ResetPassword: "RESET_PASSWORD",
  Archive: "ARCHIVE",
  Restore: "RESTORE",
  OverrideDevDone: "OVERRIDE_DEV_DONE",
} as const
export type AuditAction = (typeof AuditAction)[keyof typeof AuditAction]

export type AuditEntry = {
  /** Who made the change. */
  userId: string
  projectId?: string | null
  entityName: AuditEntity
  entityId: string
  action: AuditAction
  oldValues?: Record<string, unknown> | null
  newValues?: Record<string, unknown> | null
}

/**
 * Appends an audit-log row (FR-AUD-001). Pass the transaction of the mutation it describes,
 * so the change and its audit entry commit or roll back together. Never include secrets
 * (passwords, tokens) in `oldValues` / `newValues`.
 */
export async function recordAudit(tx: DbExecutor, entry: AuditEntry) {
  await tx.insert(auditLogs).values({
    userId: entry.userId,
    projectId: entry.projectId ?? null,
    entityName: entry.entityName,
    entityId: entry.entityId,
    action: entry.action,
    oldValues: entry.oldValues ?? null,
    newValues: entry.newValues ?? null,
  })
}

import "server-only"

import { and, desc, eq, isNull, sql } from "drizzle-orm"

import { AuditAction, AuditEntity } from "@/lib/audit"
import { db } from "@/lib/db"
import { acceptanceCriteria, auditLogs, comments, functionalRequirements, users } from "@/lib/db/schema"

import type { DashboardHistory, LatestDefect, StatusEvent } from "../types/dashboard"
import { QaStatus, type DevStatus } from "../types/status"
import { AuditField } from "../utils/audit-format"

const fr = functionalRequirements

type Values = Record<string, unknown> | null

function change<T extends string>(oldValues: Values, newValues: Values, key: string) {
  const to = newValues?.[key]
  return typeof to === "string" ? { from: oldValues?.[key] as T, to: to as T } : null
}

/** Every audited Dev/QA status change of the project's FRs, oldest first. */
async function statusEvents(projectId: string): Promise<StatusEvent[]> {
  const rows = await db
    .select({
      frId: auditLogs.entityId,
      at: auditLogs.createdAt,
      action: auditLogs.action,
      oldValues: auditLogs.oldValues,
      newValues: auditLogs.newValues,
      actor: users.fullName,
    })
    .from(auditLogs)
    .leftJoin(users, eq(users.id, auditLogs.userId))
    .where(
      and(
        eq(auditLogs.projectId, projectId),
        eq(auditLogs.entityName, AuditEntity.FunctionalRequirement),
        sql`${auditLogs.newValues} ?| array[${AuditField.Dev}, ${AuditField.Qa}]::text[]`,
      ),
    )
    .orderBy(auditLogs.createdAt)
  return rows.map(({ oldValues, newValues, action, ...row }) => {
    const before = oldValues as Values
    const after = newValues as Values
    const reason = after?.[AuditField.Reason]
    return {
      ...row,
      override: action === AuditAction.OverrideDevDone,
      reason: typeof reason === "string" && reason ? reason : null,
      dev: change<DevStatus>(before, after, AuditField.Dev),
      qa: change<QaStatus>(before, after, AuditField.Qa),
    }
  })
}

/** The newest defect comment on each currently QA-failed FR of the project. */
async function latestDefects(projectId: string): Promise<LatestDefect[]> {
  const rows = await db
    .select({ frId: comments.frId, acCode: acceptanceCriteria.acCode, author: users.fullName, at: comments.createdAt })
    .from(comments)
    .innerJoin(fr, eq(fr.id, comments.frId))
    .innerJoin(acceptanceCriteria, eq(acceptanceCriteria.id, comments.acId))
    .innerJoin(users, eq(users.id, comments.authorId))
    .where(and(eq(fr.projectId, projectId), eq(fr.qaStatus, QaStatus.Failed), eq(comments.isDefect, true), isNull(comments.deletedAt)))
    .orderBy(desc(comments.createdAt))
  const seen = new Set<string>()
  return rows.filter((row) => !seen.has(row.frId) && Boolean(seen.add(row.frId)))
}

/**
 * History behind the project dashboard (FR-UI-003): when each FR was created and archived,
 * its audited status changes (to replay trends and find blocked-since and overrides), and
 * the latest defect per failed FR. Callers must check project access first.
 */
export async function listDashboardHistory(projectId: string): Promise<DashboardHistory> {
  const [lifespans, events, defects] = await Promise.all([
    db.select({ id: fr.id, createdAt: fr.createdAt, deletedAt: fr.deletedAt }).from(fr).where(eq(fr.projectId, projectId)),
    statusEvents(projectId),
    latestDefects(projectId),
  ])
  return { lifespans, events, defects }
}

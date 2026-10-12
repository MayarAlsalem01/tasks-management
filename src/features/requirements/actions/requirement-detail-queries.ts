import "server-only"

import { and, asc, desc, eq, inArray, isNull, or } from "drizzle-orm"
import { alias } from "drizzle-orm/pg-core"

import { AuditAction, AuditEntity } from "@/lib/audit"
import { db } from "@/lib/db"
import { acceptanceCriteria, auditLogs, comments, functionalRequirements, pullRequests, users } from "@/lib/db/schema"

import type { FrAuditEntry, FrComment, FrDetail, FrPullRequest } from "../types/requirement"
import { PR_URL_PATTERN } from "../types/schemas"
import { AuditField, describeAuditChanges } from "../utils/audit-format"

const AUDIT_LIMIT = 100

async function listComments(frId: string): Promise<FrComment[]> {
  const rows = await db
    .select({
      id: comments.id,
      body: comments.body,
      isDefect: comments.isDefect,
      acCode: acceptanceCriteria.acCode,
      createdAt: comments.createdAt,
      authorId: users.id,
      authorName: users.fullName,
      authorDeactivatedAt: users.deactivatedAt,
    })
    .from(comments)
    .innerJoin(users, eq(users.id, comments.authorId))
    .leftJoin(acceptanceCriteria, eq(acceptanceCriteria.id, comments.acId))
    .where(and(eq(comments.frId, frId), isNull(comments.deletedAt)))
    .orderBy(asc(comments.createdAt))
  return rows.map(({ authorId, authorName, authorDeactivatedAt, ...c }) => ({
    ...c,
    author: { id: authorId, fullName: authorName, deactivated: authorDeactivatedAt !== null },
  }))
}

async function listPullRequests(frId: string): Promise<FrPullRequest[]> {
  const rows = await db
    .select({ id: pullRequests.id, url: pullRequests.url, state: pullRequests.state })
    .from(pullRequests)
    .where(and(eq(pullRequests.frId, frId), isNull(pullRequests.deletedAt)))
    .orderBy(asc(pullRequests.createdAt))
  return rows.map((pr) => {
    const [, repo = "", number = "0"] = PR_URL_PATTERN.exec(pr.url) ?? []
    return { ...pr, repo, number: Number(number) }
  })
}

/** FR and AC history (FR-AUD-001), newest first. AC entries are labelled with their code. */
async function listAudit(frId: string, frCode: string): Promise<FrAuditEntry[]> {
  const actors = alias(users, "actors")
  const acCodes = new Map(
    (await db.select({ id: acceptanceCriteria.id, code: acceptanceCriteria.acCode }).from(acceptanceCriteria).where(eq(acceptanceCriteria.frId, frId))).map((ac) => [ac.id, ac.code]),
  )
  const rows = await db
    .select({
      id: auditLogs.id,
      entityName: auditLogs.entityName,
      entityId: auditLogs.entityId,
      action: auditLogs.action,
      oldValues: auditLogs.oldValues,
      newValues: auditLogs.newValues,
      createdAt: auditLogs.createdAt,
      actorId: actors.id,
      actorName: actors.fullName,
      actorDeactivatedAt: actors.deactivatedAt,
    })
    .from(auditLogs)
    .leftJoin(actors, eq(actors.id, auditLogs.userId))
    .where(
      or(
        and(eq(auditLogs.entityName, AuditEntity.FunctionalRequirement), eq(auditLogs.entityId, frId)),
        acCodes.size ? and(eq(auditLogs.entityName, AuditEntity.AcceptanceCriterion), inArray(auditLogs.entityId, [...acCodes.keys()])) : undefined,
      ),
    )
    .orderBy(desc(auditLogs.createdAt))
    .limit(AUDIT_LIMIT)

  return rows.map((row) => {
    const oldValues = row.oldValues as Record<string, unknown> | null
    const newValues = row.newValues as Record<string, unknown> | null
    const label = row.entityName === AuditEntity.AcceptanceCriterion ? (acCodes.get(row.entityId) ?? "AC") : frCode
    const reason = newValues?.[AuditField.Reason]
    return {
      id: row.id,
      actor: row.actorId && row.actorName ? { id: row.actorId, fullName: row.actorName, deactivated: row.actorDeactivatedAt !== null } : null,
      changes: describeAuditChanges(row.action, oldValues, newValues, label),
      override: row.action === AuditAction.OverrideDevDone,
      reason: typeof reason === "string" ? reason : null,
      createdAt: row.createdAt,
    }
  })
}

/**
 * The drawer's Discussion and Audit data for one FR (archived FRs included). Callers must
 * check project access first. Returns `null` when the FR doesn't exist.
 */
export async function getFrDetail(frId: string): Promise<FrDetail | null> {
  const [fr] = await db
    .select({ code: functionalRequirements.frCode })
    .from(functionalRequirements)
    .where(eq(functionalRequirements.id, frId))
  if (!fr) return null
  const [commentRows, prs, audit] = await Promise.all([listComments(frId), listPullRequests(frId), listAudit(frId, fr.code)])
  return { comments: commentRows, pullRequests: prs, audit }
}

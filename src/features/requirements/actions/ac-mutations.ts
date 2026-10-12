import "server-only"

import { and, asc, eq, isNull, max } from "drizzle-orm"

import { AuditAction, AuditEntity, recordAudit } from "@/lib/audit"
import { db } from "@/lib/db"
import { acceptanceCriteria } from "@/lib/db/schema"
import { isUniqueViolation, UniqueConstraint } from "@/lib/db/errors"
import { AppError } from "@/lib/errors"

import type { AcTextInput } from "../types/schemas"
import { AuditField } from "../utils/audit-format"
import { composeCriteria, formatAcCode, nextSequence } from "../utils/codes"
import { loadAc, loadFr, requirePermission, type Viewer } from "./requirement-context"

const MANAGE_ONLY = "Only Admins and Product Owners can change acceptance criteria."

/**
 * Adds a Given/When/Then AC to the end of an FR with the next `AC<n>` code (archived codes
 * are never reused). Admin/PO only.
 */
export async function createAc(frId: string, text: AcTextInput, viewer: Viewer) {
  const fr = await loadFr(frId, viewer)
  requirePermission(fr.permissions, "canManage", MANAGE_ONLY)
  try {
    await db.transaction(async (tx) => {
      const existing = await tx.select({ code: acceptanceCriteria.acCode }).from(acceptanceCriteria).where(eq(acceptanceCriteria.frId, fr.id))
      const [{ last }] = await tx.select({ last: max(acceptanceCriteria.sortOrder) }).from(acceptanceCriteria).where(eq(acceptanceCriteria.frId, fr.id))
      const code = formatAcCode(nextSequence(existing.map((e) => e.code)))
      const [ac] = await tx
        .insert(acceptanceCriteria)
        .values({ frId: fr.id, acCode: code, givenText: text.given, whenText: text.when, thenText: text.then, criteriaText: composeCriteria(text), sortOrder: (last ?? -1) + 1 })
        .returning({ id: acceptanceCriteria.id })
      await recordAudit(tx, { userId: viewer.id, projectId: fr.projectId, entityName: AuditEntity.AcceptanceCriterion, entityId: ac.id, action: AuditAction.Create, newValues: { [AuditField.Code]: code } })
    })
  } catch (error) {
    if (isUniqueViolation(error, UniqueConstraint.AcCode)) throw new AppError("CONFLICT", "Another criterion was added at the same moment. Try again.", { cause: error })
    throw error
  }
}

/** Rewrites an AC's Given/When/Then text. Admin/PO only; dev and QA ticks are kept. */
export async function updateAcText(acId: string, text: AcTextInput, viewer: Viewer) {
  const { ac, fr } = await loadAc(acId, viewer)
  requirePermission(fr.permissions, "canManage", MANAGE_ONLY)
  const [current] = await db.select({ text: acceptanceCriteria.criteriaText }).from(acceptanceCriteria).where(eq(acceptanceCriteria.id, ac.id))
  const criteria = composeCriteria(text)
  if (current?.text === criteria) return
  await db.transaction(async (tx) => {
    await tx
      .update(acceptanceCriteria)
      .set({ givenText: text.given, whenText: text.when, thenText: text.then, criteriaText: criteria })
      .where(eq(acceptanceCriteria.id, ac.id))
    await recordAudit(tx, {
      userId: viewer.id,
      projectId: fr.projectId,
      entityName: AuditEntity.AcceptanceCriterion,
      entityId: ac.id,
      action: AuditAction.Update,
      oldValues: { [AuditField.Criteria]: current?.text ?? null },
      newValues: { [AuditField.Criteria]: criteria },
    })
  })
}

/** Moves an AC one place up (-1) or down (1) among the FR's active ACs. Admin/PO only. */
export async function moveAc(acId: string, direction: -1 | 1, viewer: Viewer) {
  const { ac, fr } = await loadAc(acId, viewer)
  requirePermission(fr.permissions, "canManage", MANAGE_ONLY)
  const order = await db
    .select({ id: acceptanceCriteria.id })
    .from(acceptanceCriteria)
    .where(and(eq(acceptanceCriteria.frId, fr.id), isNull(acceptanceCriteria.deletedAt)))
    .orderBy(asc(acceptanceCriteria.sortOrder), asc(acceptanceCriteria.createdAt))
  const from = order.findIndex((a) => a.id === ac.id)
  const to = from + direction
  if (to < 0 || to >= order.length) return
  ;[order[from], order[to]] = [order[to], order[from]]
  await db.transaction(async (tx) => {
    // Renumber everything so legacy duplicate sort orders can't make moves no-ops.
    for (const [index, row] of order.entries()) {
      await tx.update(acceptanceCriteria).set({ sortOrder: index }).where(eq(acceptanceCriteria.id, row.id))
    }
    await recordAudit(tx, {
      userId: viewer.id,
      projectId: fr.projectId,
      entityName: AuditEntity.AcceptanceCriterion,
      entityId: ac.id,
      action: AuditAction.Update,
      oldValues: { [AuditField.Position]: from + 1 },
      newValues: { [AuditField.Position]: to + 1 },
    })
  })
}

/** Archives (soft-deletes, FR-PRJ-003) an AC; it stays in the audit log. Admin/PO only. */
export async function archiveAc(acId: string, viewer: Viewer) {
  const { ac, fr } = await loadAc(acId, viewer)
  requirePermission(fr.permissions, "canManage", MANAGE_ONLY)
  await db.transaction(async (tx) => {
    await tx.update(acceptanceCriteria).set({ deletedAt: new Date() }).where(eq(acceptanceCriteria.id, ac.id))
    await recordAudit(tx, { userId: viewer.id, projectId: fr.projectId, entityName: AuditEntity.AcceptanceCriterion, entityId: ac.id, action: AuditAction.Archive })
  })
}

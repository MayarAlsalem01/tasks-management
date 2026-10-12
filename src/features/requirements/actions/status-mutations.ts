import "server-only"

import { and, eq, isNull } from "drizzle-orm"

import { NotificationType, notifyUsers } from "@/features/notifications/server"
import { AuditAction, AuditEntity, recordAudit } from "@/lib/audit"
import { Role } from "@/lib/auth/roles"
import { db, type DbExecutor } from "@/lib/db"
import { acceptanceCriteria, comments, frAssignees, functionalRequirements } from "@/lib/db/schema"
import { AppError } from "@/lib/errors"
import { ROUTES, SearchParam, withQuery } from "@/lib/routes"

import type { AssignmentRole, OverrideInput } from "../types/schemas"
import { DevStatus, QaStatus } from "../types/status"
import { AuditField } from "../utils/audit-format"
import { devDoneGate } from "../utils/permissions"
import { activeAcs, loadAc, loadFr, requirePermission, type LoadedFr, type Viewer } from "./requirement-context"

const NO_DEV = "QA Engineers can't change development status."
const NO_QA = "Developers can't change QA status."

/** Notifies the FR's assignees with `role` (e.g. its developers when QA fails). */
async function notifyAssignees(tx: DbExecutor, fr: LoadedFr, role: AssignmentRole, actorId: string, type: NotificationType, title: string) {
  const rows = await tx.select({ id: frAssignees.userId }).from(frAssignees).where(and(eq(frAssignees.frId, fr.id), eq(frAssignees.role, role)))
  return notifyUsers(
    tx,
    rows.map((r) => r.id),
    { type, title, message: fr.title, linkUrl: withQuery(ROUTES.project(fr.project.code), { [SearchParam.Fr]: fr.code }), projectId: fr.projectId, frId: fr.id, actorId },
  )
}

/**
 * Changes an FR's Dev status with Dev-Done gating (FR-WKF-001). Developers can only pick
 * Done when every AC is dev-done; Admin/PO may override by sending `override`, which can
 * also mark all ACs dev-done and is audited as `OVERRIDE_DEV_DONE` with the reason.
 * In progress is always allowed, whatever the spec status or open issues (FR-WKF-003).
 * @throws {AppError} `FORBIDDEN` for QA-only users; `VALIDATION` when Done is gated for the
 *   caller; `CONFLICT` when an Admin/PO picks Done on pending ACs without an override.
 */
export async function setDevStatus(frId: string, status: DevStatus, override: OverrideInput | undefined, viewer: Viewer) {
  const fr = await loadFr(frId, viewer)
  requirePermission(fr.permissions, "canEditDev", NO_DEV)
  if (status === fr.dev) return

  let isOverride = false
  if (status === DevStatus.Done) {
    const gate = devDoneGate(await activeAcs(db, fr.id), fr.permissions)
    if (gate.kind === "blocked") throw new AppError("VALIDATION", `${gate.pending} of ${gate.total} acceptance criteria aren't dev-done yet.`)
    if (gate.kind === "override" && !override) throw new AppError("CONFLICT", "Some acceptance criteria aren't dev-done. Confirm the override to mark this FR Done.")
    isOverride = gate.kind === "override"
  }

  await db.transaction(async (tx) => {
    await tx.update(functionalRequirements).set({ devStatus: status, updatedBy: viewer.id }).where(eq(functionalRequirements.id, fr.id))
    if (isOverride && override?.markAllAcs) {
      await tx
        .update(acceptanceCriteria)
        .set({ devDone: true, devDoneBy: viewer.id, devDoneAt: new Date() })
        .where(and(eq(acceptanceCriteria.frId, fr.id), isNull(acceptanceCriteria.deletedAt), eq(acceptanceCriteria.devDone, false)))
    }
    await recordAudit(tx, {
      userId: viewer.id,
      projectId: fr.projectId,
      entityName: AuditEntity.FunctionalRequirement,
      entityId: fr.id,
      action: isOverride ? AuditAction.OverrideDevDone : AuditAction.Update,
      oldValues: { [AuditField.Dev]: fr.dev },
      newValues: {
        [AuditField.Dev]: status,
        ...(isOverride ? { [AuditField.Reason]: override?.reason ?? null, [AuditField.MarkAllAcs]: override?.markAllAcs ?? false } : {}),
      },
    })
  })
}

/**
 * Changes an FR's QA status (FR-WKF-002; QA or Admin/PO). Failed notifies the FR's developers.
 * Passing with unpassed ACs is allowed; the UI asks for confirmation first.
 * @returns ids of the people notified.
 */
export async function setQaStatus(frId: string, status: QaStatus, viewer: Viewer) {
  const fr = await loadFr(frId, viewer)
  requirePermission(fr.permissions, "canEditQa", NO_QA)
  if (status === fr.qa) return []
  return db.transaction(async (tx) => {
    await tx.update(functionalRequirements).set({ qaStatus: status, updatedBy: viewer.id }).where(eq(functionalRequirements.id, fr.id))
    await recordAudit(tx, {
      userId: viewer.id,
      projectId: fr.projectId,
      entityName: AuditEntity.FunctionalRequirement,
      entityId: fr.id,
      action: AuditAction.Update,
      oldValues: { [AuditField.Qa]: fr.qa },
      newValues: { [AuditField.Qa]: status },
    })
    return status === QaStatus.Failed ? notifyAssignees(tx, fr, Role.Developer, viewer.id, NotificationType.QaFailed, `marked ${fr.code} as QA failed`) : []
  })
}

/**
 * Checks or unchecks an AC's "Dev done" (Developer or Admin/PO). When this completes the
 * last pending AC, the FR's QA engineers are notified (FR-NOT-001).
 * @returns ids of the people notified.
 */
export async function setAcDevDone(acId: string, done: boolean, viewer: Viewer) {
  const { ac, fr } = await loadAc(acId, viewer)
  requirePermission(fr.permissions, "canEditDev", NO_DEV)
  if (ac.devDone === done) return []
  return db.transaction(async (tx) => {
    await tx
      .update(acceptanceCriteria)
      .set({ devDone: done, devDoneBy: done ? viewer.id : null, devDoneAt: done ? new Date() : null })
      .where(eq(acceptanceCriteria.id, ac.id))
    await recordAudit(tx, {
      userId: viewer.id,
      projectId: fr.projectId,
      entityName: AuditEntity.AcceptanceCriterion,
      entityId: ac.id,
      action: AuditAction.Update,
      oldValues: { [AuditField.DevDone]: ac.devDone },
      newValues: { [AuditField.DevDone]: done },
    })
    const allDone = done && (await activeAcs(tx, fr.id)).every((a) => a.devDone)
    return allDone ? notifyAssignees(tx, fr, Role.Qa, viewer.id, NotificationType.AcsDevComplete, `finished development on every AC of ${fr.code}`) : []
  })
}

/** Checks or unchecks an AC's "QA passed" (QA or Admin/PO). Passing clears a reported defect. */
export async function setAcQaPassed(acId: string, passed: boolean, viewer: Viewer) {
  const { ac, fr } = await loadAc(acId, viewer)
  requirePermission(fr.permissions, "canEditQa", NO_QA)
  if (ac.qaPassed === passed) return
  await db.transaction(async (tx) => {
    await tx
      .update(acceptanceCriteria)
      .set({ qaPassed: passed, qaPassedBy: passed ? viewer.id : null, qaPassedAt: passed ? new Date() : null, ...(passed ? { qaFailedAt: null } : {}) })
      .where(eq(acceptanceCriteria.id, ac.id))
    await recordAudit(tx, {
      userId: viewer.id,
      projectId: fr.projectId,
      entityName: AuditEntity.AcceptanceCriterion,
      entityId: ac.id,
      action: AuditAction.Update,
      oldValues: { [AuditField.QaPassed]: ac.qaPassed },
      newValues: { [AuditField.QaPassed]: passed },
    })
  })
}

/**
 * Reports a defect on an AC (QA or Admin/PO): the AC becomes Failed and the note is posted as
 * a defect comment on it. The FR's QA status is left alone; the UI then suggests setting it
 * to Failed (FR-WKF-002).
 */
export async function reportDefect(acId: string, note: string, viewer: Viewer) {
  const { ac, fr } = await loadAc(acId, viewer)
  requirePermission(fr.permissions, "canEditQa", NO_QA)
  await db.transaction(async (tx) => {
    await tx
      .update(acceptanceCriteria)
      .set({ qaPassed: false, qaPassedBy: null, qaPassedAt: null, qaFailedAt: new Date() })
      .where(eq(acceptanceCriteria.id, ac.id))
    await tx.insert(comments).values({ frId: fr.id, acId: ac.id, authorId: viewer.id, body: note, isDefect: true })
    await recordAudit(tx, {
      userId: viewer.id,
      projectId: fr.projectId,
      entityName: AuditEntity.AcceptanceCriterion,
      entityId: ac.id,
      action: AuditAction.Update,
      oldValues: { [AuditField.QaPassed]: ac.qaPassed },
      newValues: { [AuditField.QaPassed]: false, [AuditField.Defect]: note },
    })
  })
}

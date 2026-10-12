import "server-only"

import { and, eq, inArray, isNull } from "drizzle-orm"

import { assertProjectAccess } from "@/features/projects/server"
import { AuditAction, AuditEntity, recordAudit } from "@/lib/audit"
import { db, type DbExecutor } from "@/lib/db"
import { activities, functionalRequirements, steps } from "@/lib/db/schema"

import { requireManager, type Viewer } from "./requirement-context"
import { loadActivity, loadStep } from "./structure-nodes"

/** Fixes an activity's name (FR-PRJ-002). No-op when unchanged. Admin/PO only. */
export async function renameActivity(activityId: string, name: string, viewer: Viewer) {
  requireManager(viewer)
  const activity = await loadActivity(activityId)
  await assertProjectAccess(activity.projectId, viewer, { write: true })
  if (activity.name === name) return
  await db.transaction(async (tx) => {
    await tx.update(activities).set({ name }).where(eq(activities.id, activity.id))
    await recordAudit(tx, { userId: viewer.id, projectId: activity.projectId, entityName: AuditEntity.Activity, entityId: activity.id, action: AuditAction.Update, oldValues: { name: activity.name }, newValues: { name } })
  })
}

/** Fixes a step's name (FR-PRJ-002). No-op when unchanged. Admin/PO only. */
export async function renameStep(stepId: string, name: string, viewer: Viewer) {
  requireManager(viewer)
  const step = await loadStep(stepId)
  await assertProjectAccess(step.projectId, viewer, { write: true })
  if (step.name === name) return
  await db.transaction(async (tx) => {
    await tx.update(steps).set({ name }).where(eq(steps.id, step.id))
    await recordAudit(tx, { userId: viewer.id, projectId: step.projectId, entityName: AuditEntity.Step, entityId: step.id, action: AuditAction.Update, oldValues: { name: step.name }, newValues: { name } })
  })
}

type Cascade = { tx: DbExecutor; viewer: Viewer; projectId: string; deletedAt: Date }

/**
 * Soft-deletes the live steps and their live FRs, with one audit entry each. FRs are
 * archived too, not just hidden behind their step: project counts, stats and dashboards
 * filter on the FR's own `deleted_at`.
 */
async function deleteSteps({ tx, viewer, projectId, deletedAt }: Cascade, stepIds: string[]) {
  if (!stepIds.length) return
  const frs = await tx
    .update(functionalRequirements)
    .set({ deletedAt, updatedBy: viewer.id })
    .where(and(inArray(functionalRequirements.stepId, stepIds), isNull(functionalRequirements.deletedAt)))
    .returning({ id: functionalRequirements.id })
  await tx.update(steps).set({ deletedAt }).where(inArray(steps.id, stepIds))
  const audit = { userId: viewer.id, projectId }
  for (const fr of frs) await recordAudit(tx, { ...audit, entityName: AuditEntity.FunctionalRequirement, entityId: fr.id, action: AuditAction.Archive })
  for (const id of stepIds) await recordAudit(tx, { ...audit, entityName: AuditEntity.Step, entityId: id, action: AuditAction.Delete })
}

/**
 * Soft-deletes an activity with all its steps and FRs (FR-PRJ-003). FR codes stay taken, so
 * they're never reused. There's no restore in the app yet. Admin/PO only.
 */
export async function deleteActivity(activityId: string, viewer: Viewer) {
  requireManager(viewer)
  const activity = await loadActivity(activityId)
  await assertProjectAccess(activity.projectId, viewer, { write: true })
  await db.transaction(async (tx) => {
    const cascade = { tx, viewer, projectId: activity.projectId, deletedAt: new Date() }
    const stepRows = await tx.select({ id: steps.id }).from(steps).where(and(eq(steps.activityId, activity.id), isNull(steps.deletedAt)))
    await deleteSteps(cascade, stepRows.map((s) => s.id))
    await tx.update(activities).set({ deletedAt: cascade.deletedAt }).where(eq(activities.id, activity.id))
    await recordAudit(tx, { userId: viewer.id, projectId: activity.projectId, entityName: AuditEntity.Activity, entityId: activity.id, action: AuditAction.Delete, oldValues: { name: activity.name } })
  })
}

/** Soft-deletes a step with its FRs (FR-PRJ-003); see `deleteActivity`. Admin/PO only. */
export async function deleteStep(stepId: string, viewer: Viewer) {
  requireManager(viewer)
  const step = await loadStep(stepId)
  await assertProjectAccess(step.projectId, viewer, { write: true })
  await db.transaction((tx) => deleteSteps({ tx, viewer, projectId: step.projectId, deletedAt: new Date() }, [step.id]))
}

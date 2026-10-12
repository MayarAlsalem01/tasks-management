import "server-only"

import { and, eq, isNull, max } from "drizzle-orm"

import { assertProjectAccess } from "@/features/projects/server"
import { AuditAction, AuditEntity, recordAudit } from "@/lib/audit"
import { Role } from "@/lib/auth/roles"
import { db } from "@/lib/db"
import { activities, functionalRequirements, steps } from "@/lib/db/schema"
import { isUniqueViolation, UniqueConstraint } from "@/lib/db/errors"
import { AppError } from "@/lib/errors"

import type { CreateFrInput } from "../types/schemas"
import { formatFrCode, nextSequence } from "../utils/codes"
import { assertAssignable, replaceAssignees } from "./assignment"
import { loadFr, requirePermission, type Viewer } from "./requirement-context"
import { frPermissions } from "../utils/permissions"

const MANAGE_ONLY = "Only Admins and Product Owners can change the project structure."

function requireManager(viewer: Viewer) {
  requirePermission(frPermissions(viewer.roles), "canManage", MANAGE_ONLY)
}

/** Creates an activity at the end of the project's list (FR-PRJ-002). Admin/PO only. */
export async function createActivity(projectId: string, name: string, viewer: Viewer) {
  requireManager(viewer)
  const project = await assertProjectAccess(projectId, viewer, { write: true })
  await db.transaction(async (tx) => {
    const [{ last }] = await tx.select({ last: max(activities.sortOrder) }).from(activities).where(eq(activities.projectId, project.id))
    const [activity] = await tx
      .insert(activities)
      .values({ projectId: project.id, name, sortOrder: (last ?? -1) + 1, createdBy: viewer.id })
      .returning({ id: activities.id })
    await recordAudit(tx, { userId: viewer.id, projectId: project.id, entityName: AuditEntity.Activity, entityId: activity.id, action: AuditAction.Create, newValues: { name } })
  })
}

/** Creates a step at the end of an activity (FR-PRJ-002). Admin/PO only. */
export async function createStep(activityId: string, name: string, viewer: Viewer) {
  requireManager(viewer)
  const [activity] = await db
    .select({ id: activities.id, projectId: activities.projectId })
    .from(activities)
    .where(and(eq(activities.id, activityId), isNull(activities.deletedAt)))
  if (!activity) throw new AppError("NOT_FOUND", "This activity doesn't exist anymore.", { field: "activityId" })
  await assertProjectAccess(activity.projectId, viewer, { write: true })
  await db.transaction(async (tx) => {
    const [{ last }] = await tx.select({ last: max(steps.sortOrder) }).from(steps).where(eq(steps.activityId, activity.id))
    const [step] = await tx
      .insert(steps)
      .values({ activityId: activity.id, name, sortOrder: (last ?? -1) + 1, createdBy: viewer.id })
      .returning({ id: steps.id })
    await recordAudit(tx, { userId: viewer.id, projectId: activity.projectId, entityName: AuditEntity.Step, entityId: step.id, action: AuditAction.Create, newValues: { name } })
  })
}

async function loadStep(stepId: string) {
  const [step] = await db
    .select({ id: steps.id, projectId: activities.projectId })
    .from(steps)
    .innerJoin(activities, and(eq(activities.id, steps.activityId), isNull(activities.deletedAt)))
    .where(and(eq(steps.id, stepId), isNull(steps.deletedAt)))
  if (!step) throw new AppError("NOT_FOUND", "This step doesn't exist anymore.", { field: "stepId" })
  return step
}

/**
 * Creates an FR under a step with the next `FR-<KEY>-NNN` code (never reusing archived codes),
 * its assignees (who are notified) and an audit entry. Admin/PO only.
 * @returns the new code and the ids notified.
 * @throws {AppError} `VALIDATION` for ineligible assignees; `CONFLICT` if another FR took the
 *   code at the same moment.
 */
export async function createFr(input: CreateFrInput, viewer: Viewer) {
  requireManager(viewer)
  const step = await loadStep(input.stepId)
  const project = await assertProjectAccess(step.projectId, viewer, { write: true })
  await Promise.all([assertAssignable(project.id, input.developerIds, Role.Developer), assertAssignable(project.id, input.qaIds, Role.Qa)])

  try {
    return await db.transaction(async (tx) => {
      const codes = await tx.select({ code: functionalRequirements.frCode }).from(functionalRequirements).where(eq(functionalRequirements.projectId, project.id))
      const code = formatFrCode(project.code, nextSequence(codes.map((c) => c.code)))
      const [{ last }] = await tx.select({ last: max(functionalRequirements.sortOrder) }).from(functionalRequirements).where(eq(functionalRequirements.stepId, step.id))
      const [fr] = await tx
        .insert(functionalRequirements)
        .values({
          projectId: project.id,
          stepId: step.id,
          frCode: code,
          title: input.title,
          description: input.description,
          priority: input.priority,
          specStatus: input.spec,
          targetDate: input.targetDate,
          sortOrder: (last ?? -1) + 1,
          createdBy: viewer.id,
          updatedBy: viewer.id,
        })
        .returning({ id: functionalRequirements.id })
      await recordAudit(tx, { userId: viewer.id, projectId: project.id, entityName: AuditEntity.FunctionalRequirement, entityId: fr.id, action: AuditAction.Create, newValues: { code, title: input.title } })
      const ctx = { frId: fr.id, frCode: code, frTitle: input.title, projectId: project.id, projectCode: project.code, actorId: viewer.id }
      const notified = [
        ...(await replaceAssignees(tx, ctx, Role.Developer, input.developerIds, [])),
        ...(await replaceAssignees(tx, ctx, Role.Qa, input.qaIds, [])),
      ]
      return { code, notified }
    })
  } catch (error) {
    if (isUniqueViolation(error, UniqueConstraint.FrCode)) throw new AppError("CONFLICT", "Another FR was created at the same moment. Try again.", { cause: error })
    throw error
  }
}

/**
 * Archives (soft-deletes, FR-PRJ-003) or restores an FR. Archived FRs stay in the table
 * behind "Show archived", read-only, with their history. Admin/PO only.
 */
export async function setFrArchived(frId: string, archived: boolean, viewer: Viewer) {
  const fr = await loadFr(frId, viewer, { allowArchived: true })
  requirePermission(fr.permissions, "canManage", "Only Admins and Product Owners can archive requirements.")
  if ((fr.deletedAt !== null) === archived) return
  await db.transaction(async (tx) => {
    await tx
      .update(functionalRequirements)
      .set({ deletedAt: archived ? new Date() : null, updatedBy: viewer.id })
      .where(eq(functionalRequirements.id, fr.id))
    await recordAudit(tx, {
      userId: viewer.id,
      projectId: fr.projectId,
      entityName: AuditEntity.FunctionalRequirement,
      entityId: fr.id,
      action: archived ? AuditAction.Archive : AuditAction.Restore,
    })
  })
}

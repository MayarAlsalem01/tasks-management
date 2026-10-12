import "server-only"

import { and, eq, isNull } from "drizzle-orm"

import { AuditAction, AuditEntity, recordAudit } from "@/lib/audit"
import { Role } from "@/lib/auth/roles"
import { db } from "@/lib/db"
import { comments, frAssignees, functionalRequirements, pullRequests, users } from "@/lib/db/schema"
import { AppError } from "@/lib/errors"

import type { AssignmentRole, FrFieldsInput } from "../types/schemas"
import { AuditField } from "../utils/audit-format"
import { assertAssignable, replaceAssignees } from "./assignment"
import { loadFr, requirePermission, type Viewer } from "./requirement-context"

const frs = functionalRequirements

/** Each editable field: its column key for `set()` and its audit key. */
const FIELDS = {
  title: { key: "title", audit: AuditField.Title },
  description: { key: "description", audit: AuditField.Description },
  priority: { key: "priority", audit: AuditField.Priority },
  spec: { key: "specStatus", audit: AuditField.Spec },
  targetDate: { key: "targetDate", audit: AuditField.TargetDate },
  openIssues: { key: "openIssues", audit: AuditField.OpenIssues },
} as const satisfies Record<keyof FrFieldsInput, { key: keyof typeof frs.$inferInsert; audit: string }>

/**
 * Saves Admin/PO edits from the drawer's Details tab (text, priority, spec, target date,
 * open issues) with one audit entry holding only the fields that actually changed.
 */
export async function updateFrFields(frId: string, fields: FrFieldsInput, viewer: Viewer) {
  const loaded = await loadFr(frId, viewer)
  requirePermission(loaded.permissions, "canManage", "Only Admins and Product Owners can edit requirement details.")
  const [current] = await db
    .select({ title: frs.title, description: frs.description, priority: frs.priority, spec: frs.specStatus, targetDate: frs.targetDate, openIssues: frs.openIssues })
    .from(frs)
    .where(eq(frs.id, loaded.id))
  const changed = (Object.keys(fields) as (keyof FrFieldsInput)[]).filter((k) => current[k] !== fields[k])
  if (!changed.length) return

  await db.transaction(async (tx) => {
    await tx
      .update(frs)
      .set({ ...Object.fromEntries(changed.map((k) => [FIELDS[k].key, fields[k]])), updatedBy: viewer.id })
      .where(eq(frs.id, loaded.id))
    await recordAudit(tx, {
      userId: viewer.id,
      projectId: loaded.projectId,
      entityName: AuditEntity.FunctionalRequirement,
      entityId: loaded.id,
      action: AuditAction.Update,
      oldValues: Object.fromEntries(changed.map((k) => [FIELDS[k].audit, current[k]])),
      newValues: Object.fromEntries(changed.map((k) => [FIELDS[k].audit, fields[k]])),
    })
  })
}

/**
 * Replaces the developers or QA engineers of an FR (Admin/PO only). Newly added people must
 * be active project members with the role, and are notified; the audit entry records names
 * before and after.
 * @returns ids of the people notified.
 */
export async function setAssignees(frId: string, role: AssignmentRole, userIds: string[], viewer: Viewer) {
  const fr = await loadFr(frId, viewer)
  requirePermission(fr.permissions, "canManage", "Only Admins and Product Owners can assign people.")
  const previous = await db
    .select({ id: users.id, fullName: users.fullName })
    .from(frAssignees)
    .innerJoin(users, eq(users.id, frAssignees.userId))
    .where(and(eq(frAssignees.frId, fr.id), eq(frAssignees.role, role)))
  const previousIds = previous.map((p) => p.id)
  if (previousIds.length === userIds.length && userIds.every((id) => previousIds.includes(id))) return []
  // Only newcomers must be eligible: people already assigned (e.g. since deactivated) can stay.
  const eligible = await assertAssignable(fr.projectId, userIds.filter((id) => !previousIds.includes(id)), role)
  const names = new Map([...previous.map((p) => [p.id, p.fullName] as const), ...eligible])

  const field = role === Role.Developer ? AuditField.Developers : AuditField.QaEngineers
  return db.transaction(async (tx) => {
    const ctx = { frId: fr.id, frCode: fr.code, frTitle: fr.title, projectId: fr.projectId, projectCode: fr.project.code, actorId: viewer.id }
    const notified = await replaceAssignees(tx, ctx, role, userIds, previousIds)
    await recordAudit(tx, {
      userId: viewer.id,
      projectId: fr.projectId,
      entityName: AuditEntity.FunctionalRequirement,
      entityId: fr.id,
      action: AuditAction.Update,
      oldValues: { [field]: previous.map((p) => p.fullName) },
      newValues: { [field]: userIds.map((id) => names.get(id)) },
    })
    return notified
  })
}

/** Saves the FR's team notes (any role, FRS §2). */
export async function updateNotes(frId: string, notes: string | null, viewer: Viewer) {
  const fr = await loadFr(frId, viewer)
  const [current] = await db.select({ notes: functionalRequirements.notes }).from(functionalRequirements).where(eq(functionalRequirements.id, fr.id))
  if ((current?.notes ?? null) === notes) return
  await db.transaction(async (tx) => {
    await tx.update(functionalRequirements).set({ notes, updatedBy: viewer.id }).where(eq(functionalRequirements.id, fr.id))
    await recordAudit(tx, {
      userId: viewer.id,
      projectId: fr.projectId,
      entityName: AuditEntity.FunctionalRequirement,
      entityId: fr.id,
      action: AuditAction.Update,
      oldValues: { [AuditField.Notes]: current?.notes ?? null },
      newValues: { [AuditField.Notes]: notes },
    })
  })
}

/**
 * Links a GitHub pull request to the FR (any role). New links start as `open`; there's no
 * GitHub sync yet.
 * @throws {AppError} `CONFLICT` when the same URL is already linked.
 */
export async function addPullRequest(frId: string, url: string, label: string, viewer: Viewer) {
  const fr = await loadFr(frId, viewer)
  const [existing] = await db
    .select({ id: pullRequests.id })
    .from(pullRequests)
    .where(and(eq(pullRequests.frId, fr.id), eq(pullRequests.url, url), isNull(pullRequests.deletedAt)))
  if (existing) throw new AppError("CONFLICT", "This pull request is already linked.", { field: "url" })
  await db.transaction(async (tx) => {
    await tx.insert(pullRequests).values({ frId: fr.id, url, addedBy: viewer.id })
    await recordAudit(tx, {
      userId: viewer.id,
      projectId: fr.projectId,
      entityName: AuditEntity.FunctionalRequirement,
      entityId: fr.id,
      action: AuditAction.Update,
      newValues: { [AuditField.PullRequest]: label },
    })
  })
}

/** Posts a comment on the FR (any role). Comments are their own history, so no audit entry. */
export async function addComment(frId: string, body: string, viewer: Viewer) {
  const fr = await loadFr(frId, viewer)
  await db.insert(comments).values({ frId: fr.id, authorId: viewer.id, body })
}

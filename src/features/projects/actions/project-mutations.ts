import "server-only"

import { and, eq, isNull, notInArray } from "drizzle-orm"

import { AuditAction, AuditEntity, recordAudit } from "@/lib/audit"
import { db } from "@/lib/db"
import { isUniqueViolation, UniqueConstraint } from "@/lib/db/errors"
import { projectMembers, projects } from "@/lib/db/schema"
import { AppError } from "@/lib/errors"

import type { CreateProjectInput, ProjectFormInput } from "../types/project"

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0]

async function findProject(tx: Tx, id: string) {
  const [project] = await tx
    .select()
    .from(projects)
    .where(and(eq(projects.id, id), isNull(projects.deletedAt)))
  if (!project) throw new AppError("NOT_FOUND", "This project no longer exists.")
  return project
}

/** Makes `memberIds` the project's exact member list. Returns the previous member ids. */
async function syncMembers(tx: Tx, projectId: string, memberIds: string[], actorId: string) {
  const before = await tx
    .select({ userId: projectMembers.userId })
    .from(projectMembers)
    .where(eq(projectMembers.projectId, projectId))
  await tx
    .delete(projectMembers)
    .where(
      and(
        eq(projectMembers.projectId, projectId),
        memberIds.length ? notInArray(projectMembers.userId, memberIds) : undefined,
      ),
    )
  if (memberIds.length) {
    await tx
      .insert(projectMembers)
      .values(memberIds.map((userId) => ({ projectId, userId, addedBy: actorId })))
      .onConflictDoNothing()
  }
  return before.map((m) => m.userId)
}

/**
 * Creates a project with its members and an audit entry (FR-PRJ-001).
 * @throws {AppError} `CONFLICT` on the `code` field when the key is already used.
 */
export async function createProject(input: CreateProjectInput, actorId: string) {
  try {
    return await db.transaction(async (tx) => {
      const [project] = await tx
        .insert(projects)
        .values({ code: input.code, name: input.name, description: input.description || null, createdBy: actorId })
        .returning()
      await syncMembers(tx, project.id, input.memberIds, actorId)
      await recordAudit(tx, {
        userId: actorId,
        projectId: project.id,
        entityName: AuditEntity.Project,
        entityId: project.id,
        action: AuditAction.Create,
        newValues: { code: project.code, name: project.name, memberIds: input.memberIds },
      })
      return project
    })
  } catch (error) {
    if (isUniqueViolation(error, UniqueConstraint.ProjectCode)) {
      throw new AppError("CONFLICT", "That key is already used by another project.", { field: "code", cause: error })
    }
    throw error
  }
}

/** Updates name, description and members. The key never changes after creation. */
export async function updateProject(id: string, input: ProjectFormInput, actorId: string) {
  await db.transaction(async (tx) => {
    const old = await findProject(tx, id)
    await tx
      .update(projects)
      .set({ name: input.name, description: input.description || null })
      .where(eq(projects.id, id))
    const oldMemberIds = await syncMembers(tx, id, input.memberIds, actorId)
    await recordAudit(tx, {
      userId: actorId,
      projectId: id,
      entityName: AuditEntity.Project,
      entityId: id,
      action: AuditAction.Update,
      oldValues: { name: old.name, description: old.description, memberIds: oldMemberIds },
      newValues: { name: input.name, description: input.description || null, memberIds: input.memberIds },
    })
  })
}

/**
 * Archives (read-only, hidden from switchers) or restores a project. Its FRs, ACs and
 * history are untouched either way.
 */
export async function setProjectArchived(id: string, archived: boolean, actorId: string) {
  await db.transaction(async (tx) => {
    const old = await findProject(tx, id)
    if (!!old.archivedAt === archived) return
    await tx
      .update(projects)
      .set({ archivedAt: archived ? new Date() : null })
      .where(eq(projects.id, id))
    await recordAudit(tx, {
      userId: actorId,
      projectId: id,
      entityName: AuditEntity.Project,
      entityId: id,
      action: archived ? AuditAction.Archive : AuditAction.Restore,
    })
  })
}

import "server-only"

import { and, asc, desc, eq, inArray, isNotNull, isNull, ne, notExists, or, sql } from "drizzle-orm"

import { Role } from "@/lib/auth/roles"
import { db } from "@/lib/db"
import {
  acceptanceCriteria,
  activities,
  comments,
  frAssignees,
  functionalRequirements,
  projectMembers,
  projects,
  steps,
} from "@/lib/db/schema"

import type { MyTask, UnassignedFr } from "../types/my-tasks"
import { DevStatus, QaStatus } from "../types/status"
import type { AssignmentRole } from "../types/schemas"
import { acsByFr, assigneesByFr } from "./requirement-queries"

const fr = functionalRequirements

/** Live FRs (not archived) under live steps and activities, in active projects. */
const liveFrFrom = () =>
  db
    .select({
      id: fr.id,
      code: fr.frCode,
      title: fr.title,
      description: fr.description,
      activityId: activities.id,
      activityName: activities.name,
      stepId: steps.id,
      stepName: steps.name,
      priority: fr.priority,
      spec: fr.specStatus,
      dev: fr.devStatus,
      qa: fr.qaStatus,
      targetDate: fr.targetDate,
      notes: fr.notes,
      openIssues: fr.openIssues,
      projectId: projects.id,
      projectCode: projects.code,
      projectName: projects.name,
    })
    .from(fr)
    .innerJoin(steps, and(eq(steps.id, fr.stepId), isNull(steps.deletedAt)))
    .innerJoin(activities, and(eq(activities.id, steps.activityId), isNull(activities.deletedAt)))
    .innerJoin(projects, and(eq(projects.id, fr.projectId), isNull(projects.deletedAt), isNull(projects.archivedAt)))

// Fully finished work (Dev Done and QA Passed) leaves both lists.
const unfinished = or(ne(fr.devStatus, DevStatus.Done), ne(fr.qaStatus, QaStatus.Passed))

/** When each failed AC last failed, and the latest defect note on it, for the given FRs. */
async function failuresByAc(frIds: string[]) {
  const failed = await db
    .select({ id: acceptanceCriteria.id, frId: acceptanceCriteria.frId, failedAt: acceptanceCriteria.qaFailedAt })
    .from(acceptanceCriteria)
    .where(and(inArray(acceptanceCriteria.frId, frIds), isNull(acceptanceCriteria.deletedAt), isNotNull(acceptanceCriteria.qaFailedAt)))
  const notes = failed.length
    ? await db
        .select({ acId: comments.acId, body: comments.body })
        .from(comments)
        .where(and(inArray(comments.acId, failed.map((f) => f.id)), eq(comments.isDefect, true), isNull(comments.deletedAt)))
        .orderBy(desc(comments.createdAt))
    : []
  const noteByAc = new Map<string, string>()
  for (const { acId, body } of notes) if (acId && !noteByAc.has(acId)) noteByAc.set(acId, body)
  return { failed, noteByAc }
}

/**
 * Every unfinished FR assigned to the viewer (as developer or QA) across the projects they
 * can open (FR-UI My Tasks), with ACs, assignees, the latest defect notes and when QA last
 * failed. Non-admins only see projects they're still a member of. Ordered by project name,
 * then target date.
 */
export async function listMyTasks(viewer: { id: string; isAdmin: boolean }): Promise<MyTask[]> {
  const assigned = db.select({ id: frAssignees.frId }).from(frAssignees).where(eq(frAssignees.userId, viewer.id))
  const memberProjects = db.select({ id: projectMembers.projectId }).from(projectMembers).where(eq(projectMembers.userId, viewer.id))
  const rows = await liveFrFrom()
    .where(and(inArray(fr.id, assigned), isNull(fr.deletedAt), unfinished, viewer.isAdmin ? undefined : inArray(fr.projectId, memberProjects)))
    .orderBy(asc(projects.name), sql`${fr.targetDate} asc nulls last`, asc(fr.frCode))
  if (!rows.length) return []

  const ids = rows.map((r) => r.id)
  const [acs, assignees, { failed, noteByAc }] = await Promise.all([acsByFr(inArray(fr.id, ids)), assigneesByFr(inArray(fr.id, ids)), failuresByAc(ids)])
  return rows.map(({ projectId, projectCode, projectName, ...row }) => {
    const failedAt = failed.filter((f) => f.frId === row.id).map((f) => f.failedAt!.getTime())
    return {
      ...row,
      archived: false,
      project: { id: projectId, code: projectCode, name: projectName },
      qaFailedAt: failedAt.length ? new Date(Math.max(...failedAt)) : null,
      acs: (acs.get(row.id) ?? []).map((ac) => ({ ...ac, defectNote: ac.qaFailed ? (noteByAc.get(ac.id) ?? null) : null })),
      developers: assignees.get(row.id)?.developers ?? [],
      qaEngineers: assignees.get(row.id)?.qaEngineers ?? [],
    }
  })
}

const missing = (role: AssignmentRole) =>
  notExists(db.select({ one: sql`1` }).from(frAssignees).where(and(eq(frAssignees.frId, fr.id), eq(frAssignees.role, role))))

/**
 * Unfinished FRs in active projects that still lack a developer or a QA engineer, soonest
 * target date first (Admin/PO "Unassigned FRs" panel). Callers must be Admin/PO.
 */
export async function listUnassignedFrs(): Promise<UnassignedFr[]> {
  const rows = await liveFrFrom()
    .where(and(isNull(fr.deletedAt), unfinished, or(missing(Role.Developer), missing(Role.Qa))))
    .orderBy(sql`${fr.targetDate} asc nulls last`, asc(fr.frCode))
  if (!rows.length) return []
  const assignees = await assigneesByFr(inArray(fr.id, rows.map((r) => r.id)))
  return rows.map((r) => ({
    id: r.id,
    code: r.code,
    title: r.title,
    priority: r.priority,
    targetDate: r.targetDate,
    projectId: r.projectId,
    developers: assignees.get(r.id)?.developers ?? [],
    qaEngineers: assignees.get(r.id)?.qaEngineers ?? [],
  }))
}

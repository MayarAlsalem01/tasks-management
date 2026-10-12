import "server-only"

import { and, asc, eq, inArray, isNull, or } from "drizzle-orm"

import { ADMIN_ROLES, Role, ROLES } from "@/lib/auth/roles"
import { db } from "@/lib/db"
import {
  acceptanceCriteria,
  activities,
  frAssignees,
  functionalRequirements,
  projectMembers,
  steps,
  userRoles,
  users,
} from "@/lib/db/schema"

import type { AcRow, FrRow, Person, ProjectPerson } from "../types/requirement"

const person = (u: { id: string; fullName: string; deactivatedAt: Date | null }): Person => ({
  id: u.id,
  fullName: u.fullName,
  deactivated: u.deactivatedAt !== null,
})

/** ACs of every FR in the project (active ACs only), grouped by FR id. */
async function acsByFr(projectId: string) {
  const rows = await db
    .select({
      frId: acceptanceCriteria.frId,
      id: acceptanceCriteria.id,
      code: acceptanceCriteria.acCode,
      given: acceptanceCriteria.givenText,
      when: acceptanceCriteria.whenText,
      then: acceptanceCriteria.thenText,
      text: acceptanceCriteria.criteriaText,
      devDone: acceptanceCriteria.devDone,
      qaPassed: acceptanceCriteria.qaPassed,
      qaFailedAt: acceptanceCriteria.qaFailedAt,
    })
    .from(acceptanceCriteria)
    .innerJoin(functionalRequirements, eq(functionalRequirements.id, acceptanceCriteria.frId))
    .where(and(eq(functionalRequirements.projectId, projectId), isNull(acceptanceCriteria.deletedAt)))
    .orderBy(asc(acceptanceCriteria.sortOrder), asc(acceptanceCriteria.createdAt))
  const map = new Map<string, AcRow[]>()
  for (const { frId, qaFailedAt, ...ac } of rows) {
    map.set(frId, [...(map.get(frId) ?? []), { ...ac, qaFailed: qaFailedAt !== null }])
  }
  return map
}

/** Developer / QA assignees of every FR in the project, grouped by FR id. */
async function assigneesByFr(projectId: string) {
  const rows = await db
    .select({
      frId: frAssignees.frId,
      role: frAssignees.role,
      id: users.id,
      fullName: users.fullName,
      deactivatedAt: users.deactivatedAt,
    })
    .from(frAssignees)
    .innerJoin(functionalRequirements, eq(functionalRequirements.id, frAssignees.frId))
    .innerJoin(users, eq(users.id, frAssignees.userId))
    .where(eq(functionalRequirements.projectId, projectId))
    .orderBy(asc(frAssignees.assignedAt))
  const map = new Map<string, { developers: Person[]; qaEngineers: Person[] }>()
  for (const { frId, role, ...user } of rows) {
    const entry = map.get(frId) ?? { developers: [], qaEngineers: [] }
    ;(role === Role.Developer ? entry.developers : entry.qaEngineers).push(person(user))
    map.set(frId, entry)
  }
  return map
}

/**
 * Every FR of a project for the table (FR-UI-001), in tree order (activity, step, FR), with
 * ACs and assignees. Archived (soft-deleted) FRs are included and flagged so the table can
 * toggle them without a refetch; FRs under deleted activities or steps are left out.
 * Callers must check project access first.
 */
export async function listProjectRequirements(projectId: string): Promise<FrRow[]> {
  const fr = functionalRequirements
  const [rows, acs, assignees] = await Promise.all([
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
        deletedAt: fr.deletedAt,
      })
      .from(fr)
      .innerJoin(steps, and(eq(steps.id, fr.stepId), isNull(steps.deletedAt)))
      .innerJoin(activities, and(eq(activities.id, steps.activityId), isNull(activities.deletedAt)))
      .where(eq(fr.projectId, projectId))
      .orderBy(asc(activities.sortOrder), asc(activities.createdAt), asc(steps.sortOrder), asc(steps.createdAt), asc(fr.sortOrder), asc(fr.frCode)),
    acsByFr(projectId),
    assigneesByFr(projectId),
  ])
  return rows.map(({ deletedAt, ...row }) => ({
    ...row,
    archived: deletedAt !== null,
    acs: acs.get(row.id) ?? [],
    developers: assignees.get(row.id)?.developers ?? [],
    qaEngineers: assignees.get(row.id)?.qaEngineers ?? [],
  }))
}

/**
 * Active people who can work in a project, with their roles: its members plus every Admin/PO
 * (who can access all projects). Feeds the assignee menus and filters.
 */
export async function listProjectPeople(projectId: string): Promise<ProjectPerson[]> {
  const memberIds = db.select({ id: projectMembers.userId }).from(projectMembers).where(eq(projectMembers.projectId, projectId))
  const adminIds = db.select({ id: userRoles.userId }).from(userRoles).where(inArray(userRoles.role, ADMIN_ROLES))
  const rows = await db
    .select({ id: users.id, fullName: users.fullName, role: userRoles.role })
    .from(users)
    .innerJoin(userRoles, eq(userRoles.userId, users.id))
    .where(and(isNull(users.deactivatedAt), or(inArray(users.id, memberIds), inArray(users.id, adminIds))))
    .orderBy(asc(users.fullName))
  const people = new Map<string, ProjectPerson>()
  for (const { role, ...user } of rows) {
    const entry = people.get(user.id) ?? { ...user, deactivated: false, roles: [] as Role[] }
    entry.roles.push(role)
    people.set(user.id, entry)
  }
  for (const entry of people.values()) entry.roles.sort((a, b) => ROLES.indexOf(a) - ROLES.indexOf(b))
  return [...people.values()]
}

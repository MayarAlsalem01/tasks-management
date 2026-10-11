import "server-only"

import { and, asc, eq, inArray, isNotNull, isNull, sql } from "drizzle-orm"

import { ADMIN_ROLES, formatRoles, type Role } from "@/lib/auth/roles"
import { db } from "@/lib/db"
import { functionalRequirements, projectMembers, projects, userRoles, users } from "@/lib/db/schema"

import type { AdminProjectRow, MemberOption, ProjectMember } from "../types/project"
import { percent } from "../utils/progress"

/** Active users holding ADMIN or PO; they can access every project. */
async function listActiveAdmins(): Promise<ProjectMember[]> {
  const rows = await db
    .selectDistinct({ id: users.id, fullName: users.fullName })
    .from(users)
    .innerJoin(userRoles, eq(userRoles.userId, users.id))
    .where(and(isNull(users.deactivatedAt), inArray(userRoles.role, ADMIN_ROLES)))
  return rows.map((r) => ({ ...r, deactivated: false }))
}

async function frStatsByProject(projectIds: string[]) {
  if (!projectIds.length) return new Map<string, { total: number; done: number; passed: number }>()
  const rows = await db
    .select({
      projectId: functionalRequirements.projectId,
      total: sql<number>`count(*)::int`,
      done: sql<number>`count(*) filter (where ${functionalRequirements.devStatus} = 'done')::int`,
      passed: sql<number>`count(*) filter (where ${functionalRequirements.qaStatus} = 'passed')::int`,
    })
    .from(functionalRequirements)
    .where(and(inArray(functionalRequirements.projectId, projectIds), isNull(functionalRequirements.deletedAt)))
    .groupBy(functionalRequirements.projectId)
  return new Map(rows.map(({ projectId, ...stats }) => [projectId, stats]))
}

/**
 * Rows for the admin Projects table (Active or Archived tab): team, FR count and
 * Dev done / QA passed progress. Deleted projects are never listed.
 */
export async function listAdminProjects(archived: boolean): Promise<AdminProjectRow[]> {
  const rows = await db
    .select({ id: projects.id, code: projects.code, name: projects.name, description: projects.description })
    .from(projects)
    .where(and(isNull(projects.deletedAt), archived ? isNotNull(projects.archivedAt) : isNull(projects.archivedAt)))
    .orderBy(asc(projects.name))
  const ids = rows.map((p) => p.id)

  const [memberRows, admins, stats] = await Promise.all([
    ids.length
      ? db
          .select({
            projectId: projectMembers.projectId,
            id: users.id,
            fullName: users.fullName,
            deactivatedAt: users.deactivatedAt,
          })
          .from(projectMembers)
          .innerJoin(users, eq(users.id, projectMembers.userId))
          .where(inArray(projectMembers.projectId, ids))
          .orderBy(asc(users.fullName))
      : [],
    listActiveAdmins(),
    frStatsByProject(ids),
  ])

  return rows.map((project) => {
    const members = memberRows.filter((m) => m.projectId === project.id)
    const active = members
      .filter((m) => !m.deactivatedAt)
      .map((m) => ({ id: m.id, fullName: m.fullName, deactivated: false }))
    const team = [...active, ...admins.filter((a) => !active.some((m) => m.id === a.id))]
    const s = stats.get(project.id) ?? { total: 0, done: 0, passed: 0 }
    return {
      ...project,
      archived,
      memberIds: members.map((m) => m.id),
      team,
      frCount: s.total,
      devDonePct: percent(s.done, s.total),
      qaPassedPct: percent(s.passed, s.total),
    }
  })
}

/** Active users who can be added as project members (admins are implicit members). */
export async function listMemberOptions(): Promise<MemberOption[]> {
  const rows = await db
    .select({ id: users.id, fullName: users.fullName, role: userRoles.role })
    .from(users)
    .innerJoin(userRoles, eq(userRoles.userId, users.id))
    .where(isNull(users.deactivatedAt))
    .orderBy(asc(users.fullName))

  const byUser = new Map<string, { fullName: string; roles: Role[] }>()
  for (const row of rows) {
    const entry = byUser.get(row.id) ?? { fullName: row.fullName, roles: [] }
    entry.roles.push(row.role)
    byUser.set(row.id, entry)
  }
  return [...byUser]
    .filter(([, u]) => !u.roles.some((role) => ADMIN_ROLES.includes(role)))
    .map(([id, u]) => ({ id, fullName: u.fullName, rolesLabel: formatRoles(u.roles) }))
}

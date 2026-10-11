import "server-only"

import { and, asc, eq, ilike, inArray, isNotNull, isNull, or, sql, type SQL } from "drizzle-orm"

import type { Role } from "@/lib/auth/roles"
import { CREDENTIAL_PROVIDER } from "@/lib/auth/credentials"
import { db } from "@/lib/db"
import { accounts, projectMembers, projects, userRoles, users } from "@/lib/db/schema"

import type { AdminUserRow, ProjectOption, UserFilters } from "../types/user"

function filterConditions(filters: UserFilters) {
  const conditions: SQL[] = []
  if (filters.q) {
    const term = `%${filters.q.replace(/[%_\\]/g, "\\$&")}%`
    conditions.push(or(ilike(users.fullName, term), ilike(users.username, term), ilike(users.email, term))!)
  }
  if (filters.status === "active") conditions.push(isNull(users.deactivatedAt))
  if (filters.status === "deactivated") conditions.push(isNotNull(users.deactivatedAt))
  if (filters.role) {
    conditions.push(
      inArray(users.id, db.select({ id: userRoles.userId }).from(userRoles).where(eq(userRoles.role, filters.role))),
    )
  }
  if (filters.project) {
    conditions.push(
      inArray(
        users.id,
        db
          .select({ id: projectMembers.userId })
          .from(projectMembers)
          .innerJoin(projects, eq(projects.id, projectMembers.projectId))
          .where(eq(projects.code, filters.project)),
      ),
    )
  }
  return conditions
}

/**
 * Users for the admin table, filtered by search text (name, username, email), role,
 * project membership and status. Deactivated users stay listed (FR-IAM-003).
 */
export async function listUsers(filters: UserFilters): Promise<AdminUserRow[]> {
  const rows = await db
    .select({
      id: users.id,
      username: users.username,
      fullName: users.fullName,
      email: users.email,
      deactivatedAt: users.deactivatedAt,
      lastLoginAt: users.lastLoginAt,
      passwordChangedAt: accounts.updatedAt,
    })
    .from(users)
    .leftJoin(accounts, and(eq(accounts.userId, users.id), eq(accounts.providerId, CREDENTIAL_PROVIDER)))
    .where(and(...filterConditions(filters)))
    .orderBy(sql`${users.deactivatedAt} is not null`, asc(users.fullName))
  const ids = rows.map((u) => u.id)
  if (!ids.length) return []

  const [roleRows, memberRows] = await Promise.all([
    db.select().from(userRoles).where(inArray(userRoles.userId, ids)),
    db
      .select({ userId: projectMembers.userId, id: projects.id, code: projects.code })
      .from(projectMembers)
      .innerJoin(projects, eq(projects.id, projectMembers.projectId))
      .where(and(inArray(projectMembers.userId, ids), isNull(projects.deletedAt), isNull(projects.archivedAt)))
      .orderBy(asc(projects.code)),
  ])

  return rows.map(({ deactivatedAt, ...user }) => ({
    ...user,
    deactivated: !!deactivatedAt,
    roles: roleRows.filter((r) => r.userId === user.id).map((r) => r.role as Role),
    projects: memberRows.filter((m) => m.userId === user.id).map(({ id, code }) => ({ id, code })),
  }))
}

/** "N active · M deactivated" counts for the page header, ignoring filters. */
export async function countUsersByStatus() {
  const [row] = await db
    .select({
      active: sql<number>`count(*) filter (where ${users.deactivatedAt} is null)::int`,
      deactivated: sql<number>`count(*) filter (where ${users.deactivatedAt} is not null)::int`,
    })
    .from(users)
  return row ?? { active: 0, deactivated: 0 }
}

/** Active projects to offer in the user form and the project filter. */
export async function listProjectOptions(): Promise<ProjectOption[]> {
  return db
    .select({ id: projects.id, code: projects.code, name: projects.name })
    .from(projects)
    .where(and(isNull(projects.deletedAt), isNull(projects.archivedAt)))
    .orderBy(asc(projects.code))
}

import "server-only"

import { and, asc, count, countDistinct, eq, inArray, isNotNull, isNull, ne, sql } from "drizzle-orm"

import type { CurrentUser } from "@/lib/auth/session"
import { db } from "@/lib/db"
import { AppError } from "@/lib/errors"
import {
  activities,
  frAssignees,
  functionalRequirements,
  projectMembers,
  projects,
  steps,
} from "@/lib/db/schema"

import type { ProjectNav, ProjectSummary } from "../types/project"

type Viewer = Pick<CurrentUser, "id" | "isAdmin">

const isActive = and(isNull(projects.deletedAt), isNull(projects.archivedAt))

/** Open (not Done) FRs assigned to `userId`, counted per project. */
async function openAssignedCounts(userId: string) {
  const rows = await db
    .select({ projectId: functionalRequirements.projectId, n: countDistinct(functionalRequirements.id) })
    .from(functionalRequirements)
    .innerJoin(frAssignees, eq(frAssignees.frId, functionalRequirements.id))
    .where(
      and(
        eq(frAssignees.userId, userId),
        isNull(functionalRequirements.deletedAt),
        ne(functionalRequirements.devStatus, "done"),
      ),
    )
    .groupBy(functionalRequirements.projectId)
  return new Map(rows.map((r) => [r.projectId, r.n]))
}

/**
 * Active projects the viewer can open (FR-PRJ-001): every project for Admin/PO, otherwise
 * their memberships. Archived and deleted projects are excluded. Includes "mine" counts.
 */
export async function listAccessibleProjects(viewer: Viewer): Promise<ProjectSummary[]> {
  const columns = { id: projects.id, code: projects.code, name: projects.name }
  const [rows, mine] = await Promise.all([
    viewer.isAdmin
      ? db.select(columns).from(projects).where(isActive).orderBy(asc(projects.name))
      : db
          .select(columns)
          .from(projects)
          .innerJoin(projectMembers, eq(projectMembers.projectId, projects.id))
          .where(and(isActive, eq(projectMembers.userId, viewer.id)))
          .orderBy(asc(projects.name)),
    openAssignedCounts(viewer.id),
  ])
  return rows.map((p) => ({ ...p, mineCount: mine.get(p.id) ?? 0 }))
}

/** Number of archived (not deleted) projects, for the admin switcher's "Archived (n)". */
export async function countArchivedProjects() {
  const [row] = await db
    .select({ n: count() })
    .from(projects)
    .where(and(isNull(projects.deletedAt), isNotNull(projects.archivedAt)))
  return row?.n ?? 0
}

async function canAccess(projectId: string, viewer: Viewer) {
  if (viewer.isAdmin) return true
  const [row] = await db
    .select({ n: count() })
    .from(projectMembers)
    .where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, viewer.id)))
  return (row?.n ?? 0) > 0
}

/**
 * Loads a project the viewer may work in, for services in other features. Write access also
 * requires the project to be active, since archived projects are read-only.
 * @throws {AppError} `NOT_FOUND` when the project is missing, deleted or not accessible (the
 *   same error for each, so ids can't be probed); `FORBIDDEN` when archived and `write` is set.
 */
export async function assertProjectAccess(projectId: string, viewer: Viewer, { write = false } = {}) {
  const [project] = await db
    .select({ id: projects.id, code: projects.code, archivedAt: projects.archivedAt })
    .from(projects)
    .where(and(eq(projects.id, projectId), isNull(projects.deletedAt)))
  if (!project || !(await canAccess(project.id, viewer))) throw new AppError("NOT_FOUND", "This project doesn't exist or you don't have access to it.")
  if (write && project.archivedAt) throw new AppError("FORBIDDEN", "This project is archived and read-only.")
  return { id: project.id, code: project.code }
}

/**
 * Activities → Steps trees with FR counts for the given projects (in the same order).
 * The shell passes the viewer's accessible projects so the sidebar can switch instantly.
 */
export async function listProjectNavs(projectRows: { id: string; code: string; name: string }[]): Promise<ProjectNav[]> {
  const projectIds = projectRows.map((p) => p.id)
  if (!projectIds.length) return []

  const activityRows = await db
    .select({ id: activities.id, projectId: activities.projectId, name: activities.name })
    .from(activities)
    .where(and(inArray(activities.projectId, projectIds), isNull(activities.deletedAt)))
    .orderBy(asc(activities.sortOrder), asc(activities.createdAt))
  const activityIds = activityRows.map((a) => a.id)

  const stepRows = activityIds.length
    ? await db
        .select({
          id: steps.id,
          activityId: steps.activityId,
          name: steps.name,
          frCount: sql<number>`count(${functionalRequirements.id})::int`,
        })
        .from(steps)
        .leftJoin(
          functionalRequirements,
          and(eq(functionalRequirements.stepId, steps.id), isNull(functionalRequirements.deletedAt)),
        )
        .where(and(inArray(steps.activityId, activityIds), isNull(steps.deletedAt)))
        .groupBy(steps.id)
        .orderBy(asc(steps.sortOrder), asc(steps.createdAt))
    : []

  return projectRows.map((project) => {
    const tree = activityRows
      .filter((a) => a.projectId === project.id)
      .map(({ id, name }) => {
        const children = stepRows.filter((s) => s.activityId === id)
        return {
          id,
          name,
          steps: children.map((s) => ({ id: s.id, name: s.name, frCount: s.frCount })),
          frCount: children.reduce((sum, s) => sum + s.frCount, 0),
        }
      })
    return { ...project, activities: tree, frCount: tree.reduce((sum, a) => sum + a.frCount, 0) }
  })
}

/**
 * One project's Activities → Steps tree with FR counts, for the project page header.
 * Returns `null` when the project doesn't exist, is deleted, or the viewer has no access,
 * so callers can render `notFound()` without revealing which case it was.
 */
export async function getProjectNav(code: string, viewer: Viewer): Promise<ProjectNav | null> {
  const [project] = await db
    .select({ id: projects.id, code: projects.code, name: projects.name })
    .from(projects)
    .where(and(eq(projects.code, code.toUpperCase()), isNull(projects.deletedAt)))
  if (!project || !(await canAccess(project.id, viewer))) return null
  const [nav] = await listProjectNavs([project])
  return nav
}

import "server-only"

import { and, eq, inArray } from "drizzle-orm"

import { NotificationType, notifyUsers } from "@/features/notifications/server"
import { Role } from "@/lib/auth/roles"
import type { DbExecutor } from "@/lib/db"
import { frAssignees } from "@/lib/db/schema"
import { AppError } from "@/lib/errors"
import { ROUTES, SearchParam, withQuery } from "@/lib/routes"

import type { AssignmentRole } from "../types/schemas"
import { listProjectPeople } from "./requirement-queries"

const ROLE_NOUN: Record<AssignmentRole, string> = { [Role.Developer]: "developer", [Role.Qa]: "QA engineer" }

/**
 * Checks every id is an active person in the project holding the role (an Admin who is also
 * a Developer can be assigned as developer, as the user requested), and returns their names.
 * @throws {AppError} `VALIDATION` naming the field when someone can't take the role.
 */
export async function assertAssignable(projectId: string, userIds: string[], role: AssignmentRole) {
  if (!userIds.length) return new Map<string, string>()
  const people = await listProjectPeople(projectId)
  const eligible = new Map(people.filter((p) => p.roles.includes(role)).map((p) => [p.id, p.fullName]))
  if (userIds.some((id) => !eligible.has(id))) {
    const field = role === Role.Developer ? "developerIds" : "qaIds"
    throw new AppError("VALIDATION", `Only active project members with the ${ROLE_NOUN[role]} role can be assigned.`, { field })
  }
  return eligible
}

type AssignContext = { frId: string; frCode: string; frTitle: string; projectId: string; projectCode: string; actorId: string }

/**
 * Replaces the FR's assignees for one role inside `tx` and notifies people who were newly
 * added (FR-NOT-001 "task assignment"). Returns the ids notified.
 */
export async function replaceAssignees(tx: DbExecutor, ctx: AssignContext, role: AssignmentRole, userIds: string[], previousIds: string[]) {
  const removed = previousIds.filter((id) => !userIds.includes(id))
  const added = userIds.filter((id) => !previousIds.includes(id))
  if (removed.length) {
    await tx.delete(frAssignees).where(and(eq(frAssignees.frId, ctx.frId), eq(frAssignees.role, role), inArray(frAssignees.userId, removed)))
  }
  if (added.length) {
    await tx.insert(frAssignees).values(added.map((userId) => ({ frId: ctx.frId, userId, role, assignedBy: ctx.actorId })))
  }
  return notifyUsers(tx, added, {
    type: NotificationType.Assigned,
    title: `assigned you as ${ROLE_NOUN[role]} on ${ctx.frCode}`,
    message: ctx.frTitle,
    linkUrl: withQuery(ROUTES.project(ctx.projectCode), { [SearchParam.Fr]: ctx.frCode }),
    projectId: ctx.projectId,
    frId: ctx.frId,
    actorId: ctx.actorId,
  })
}

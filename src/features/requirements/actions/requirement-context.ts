import "server-only"

import { and, eq, isNull } from "drizzle-orm"

import { assertProjectAccess } from "@/features/projects/server"
import type { CurrentUser } from "@/lib/auth/session"
import { db, type DbExecutor } from "@/lib/db"
import { acceptanceCriteria, functionalRequirements } from "@/lib/db/schema"
import { AppError } from "@/lib/errors"

import { frPermissions, type FrPermissions } from "../utils/permissions"

export type Viewer = Pick<CurrentUser, "id" | "fullName" | "roles" | "isAdmin">

const NOT_FOUND = "This requirement doesn't exist or you don't have access to it."

/**
 * Loads an FR for a service call and checks the viewer can open its project. Writes also
 * require an active project and an FR that isn't archived (archived FRs are read-only;
 * pass `allowArchived` for restore).
 * @throws {AppError} `NOT_FOUND` (missing or no access, indistinguishable) or `FORBIDDEN`.
 */
export async function loadFr(frId: string, viewer: Viewer, { write = true, allowArchived = false } = {}) {
  const fr = functionalRequirements
  const [row] = await db
    .select({ id: fr.id, projectId: fr.projectId, code: fr.frCode, title: fr.title, dev: fr.devStatus, qa: fr.qaStatus, deletedAt: fr.deletedAt })
    .from(fr)
    .where(eq(fr.id, frId))
  if (!row) throw new AppError("NOT_FOUND", NOT_FOUND)
  const project = await assertProjectAccess(row.projectId, viewer, { write })
  if (write && row.deletedAt && !allowArchived) throw new AppError("FORBIDDEN", "Archived requirements are read-only. Restore it first.")
  return { ...row, project, permissions: frPermissions(viewer.roles) }
}

export type LoadedFr = Awaited<ReturnType<typeof loadFr>>

/** Loads an active AC and its FR for a write; same checks as `loadFr`. */
export async function loadAc(acId: string, viewer: Viewer) {
  const [ac] = await db
    .select({ id: acceptanceCriteria.id, frId: acceptanceCriteria.frId, code: acceptanceCriteria.acCode, devDone: acceptanceCriteria.devDone, qaPassed: acceptanceCriteria.qaPassed })
    .from(acceptanceCriteria)
    .where(and(eq(acceptanceCriteria.id, acId), isNull(acceptanceCriteria.deletedAt)))
  if (!ac) throw new AppError("NOT_FOUND", "This acceptance criterion doesn't exist or was archived.")
  return { ac, fr: await loadFr(ac.frId, viewer) }
}

/**
 * Enforces one FRS §2 permission on the server (the UI hides the control already).
 * @throws {AppError} `FORBIDDEN` with `message`.
 */
export function requirePermission(permissions: FrPermissions, key: keyof FrPermissions, message: string) {
  if (!permissions[key]) throw new AppError("FORBIDDEN", message)
}

/** Active ACs of an FR, in order, for gating and "all done" checks. */
export async function activeAcs(executor: DbExecutor, frId: string) {
  return executor
    .select({ id: acceptanceCriteria.id, devDone: acceptanceCriteria.devDone, qaPassed: acceptanceCriteria.qaPassed })
    .from(acceptanceCriteria)
    .where(and(eq(acceptanceCriteria.frId, frId), isNull(acceptanceCriteria.deletedAt)))
}

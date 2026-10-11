import "server-only"

import { and, eq, notInArray } from "drizzle-orm"

import { AuditAction, AuditEntity, recordAudit } from "@/lib/audit"
import { CREDENTIAL_PROVIDER, generatePassword } from "@/lib/auth/credentials"
import { hashPassword } from "@/lib/auth/password"
import { hasAdminRole, type Role } from "@/lib/auth/roles"
import { db } from "@/lib/db"
import { isUniqueViolation, UniqueConstraint } from "@/lib/db/errors"
import { accounts, projectMembers, sessions, userRoles, users } from "@/lib/db/schema"
import { AppError } from "@/lib/errors"

import type { CreateUserInput, UpdateUserInput } from "../types/user"

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0]

/** Maps unique-constraint violations on username/email to inline form errors. */
function rethrowDuplicate(error: unknown): never {
  if (isUniqueViolation(error, UniqueConstraint.Username)) {
    throw new AppError("CONFLICT", "That username is already in use", { field: "username", cause: error })
  }
  if (isUniqueViolation(error, UniqueConstraint.Email)) {
    throw new AppError("CONFLICT", "That email is already in use", { field: "email", cause: error })
  }
  throw error
}

async function replaceRoles(tx: Tx, userId: string, roles: Role[], actorId: string) {
  await tx.delete(userRoles).where(eq(userRoles.userId, userId))
  await tx.insert(userRoles).values(roles.map((role) => ({ userId, role, grantedBy: actorId })))
}

/**
 * Makes `projectIds` the user's exact memberships (an empty list removes them all).
 * Admin/PO keep theirs untouched, since they can see every project anyway.
 */
async function replaceMemberships(tx: Tx, userId: string, input: { roles: Role[]; projectIds: string[] }, actorId: string) {
  if (hasAdminRole(input.roles)) return
  await tx
    .delete(projectMembers)
    .where(
      and(
        eq(projectMembers.userId, userId),
        input.projectIds.length ? notInArray(projectMembers.projectId, input.projectIds) : undefined,
      ),
    )
  if (!input.projectIds.length) return
  await tx
    .insert(projectMembers)
    .values(input.projectIds.map((projectId) => ({ projectId, userId, addedBy: actorId })))
    .onConflictDoNothing()
}

/**
 * Provisions an account (FR-IAM-001): user, hashed credential, roles and memberships in one
 * transaction, plus an audit entry. The user must change the password at first sign-in.
 * @throws {AppError} `CONFLICT` on `username` / `email` when already taken.
 */
export async function createUser(input: CreateUserInput, actorId: string) {
  const passwordHash = await hashPassword(input.password)
  try {
    return await db.transaction(async (tx) => {
      const [user] = await tx
        .insert(users)
        .values({
          username: input.username,
          displayUsername: input.username,
          fullName: input.fullName,
          email: input.email,
          mustChangePassword: true,
        })
        .returning({ id: users.id })
      await tx
        .insert(accounts)
        .values({ userId: user.id, accountId: user.id, providerId: CREDENTIAL_PROVIDER, password: passwordHash })
      await replaceRoles(tx, user.id, input.roles, actorId)
      await replaceMemberships(tx, user.id, input, actorId)
      await recordAudit(tx, {
        userId: actorId,
        entityName: AuditEntity.User,
        entityId: user.id,
        action: AuditAction.Create,
        newValues: { username: input.username, fullName: input.fullName, email: input.email, roles: input.roles, projectIds: input.projectIds },
      })
      return user
    })
  } catch (error) {
    rethrowDuplicate(error)
  }
}

async function findUser(tx: Tx, id: string) {
  const [user] = await tx.select().from(users).where(eq(users.id, id))
  if (!user) throw new AppError("NOT_FOUND", "This user no longer exists.")
  return user
}

/**
 * Updates name, email, roles and memberships, with an audit entry.
 * @throws {AppError} `FORBIDDEN` when admins try to remove their own admin access;
 *   `CONFLICT` on `email` when it's taken.
 */
export async function updateUser(id: string, input: UpdateUserInput, actorId: string) {
  if (id === actorId && !hasAdminRole(input.roles)) {
    throw new AppError("FORBIDDEN", "You can't remove your own Admin / Product Owner role.", { field: "roles" })
  }
  try {
    await db.transaction(async (tx) => {
      const old = await findUser(tx, id)
      const oldRoles = await tx.select({ role: userRoles.role }).from(userRoles).where(eq(userRoles.userId, id))
      await tx.update(users).set({ fullName: input.fullName, email: input.email }).where(eq(users.id, id))
      await replaceRoles(tx, id, input.roles, actorId)
      await replaceMemberships(tx, id, input, actorId)
      await recordAudit(tx, {
        userId: actorId,
        entityName: AuditEntity.User,
        entityId: id,
        action: AuditAction.Update,
        oldValues: { fullName: old.fullName, email: old.email, roles: oldRoles.map((r) => r.role) },
        newValues: { fullName: input.fullName, email: input.email, roles: input.roles, projectIds: input.projectIds },
      })
    })
  } catch (error) {
    rethrowDuplicate(error)
  }
}

/**
 * Deactivates (FR-IAM-003: blocks sign-in and ends every session, history is kept) or
 * reactivates an account.
 * @throws {AppError} `FORBIDDEN` when admins try to deactivate themselves.
 */
export async function setUserDeactivated(id: string, deactivated: boolean, actorId: string) {
  if (deactivated && id === actorId) {
    throw new AppError("FORBIDDEN", "You can't deactivate your own account.")
  }
  await db.transaction(async (tx) => {
    const old = await findUser(tx, id)
    if (!!old.deactivatedAt === deactivated) return
    await tx
      .update(users)
      .set({ deactivatedAt: deactivated ? new Date() : null, failedLoginCount: 0, lockedUntil: null })
      .where(eq(users.id, id))
    if (deactivated) await tx.delete(sessions).where(eq(sessions.userId, id))
    await recordAudit(tx, {
      userId: actorId,
      entityName: AuditEntity.User,
      entityId: id,
      action: deactivated ? AuditAction.Deactivate : AuditAction.Reactivate,
    })
  })
}

/**
 * Issues a new random password, signs the user out everywhere, clears any lockout and
 * forces a change at next sign-in. Returns the password so the admin can share it once;
 * it's never stored in plain text or written to the audit log.
 */
export async function resetUserPassword(id: string, actorId: string) {
  const password = generatePassword()
  const passwordHash = await hashPassword(password)
  await db.transaction(async (tx) => {
    await findUser(tx, id)
    await tx
      .update(accounts)
      .set({ password: passwordHash })
      .where(and(eq(accounts.userId, id), eq(accounts.providerId, CREDENTIAL_PROVIDER)))
    await tx
      .update(users)
      .set({ mustChangePassword: true, failedLoginCount: 0, lockedUntil: null })
      .where(eq(users.id, id))
    await tx.delete(sessions).where(eq(sessions.userId, id))
    await recordAudit(tx, { userId: actorId, entityName: AuditEntity.User, entityId: id, action: AuditAction.ResetPassword })
  })
  return password
}

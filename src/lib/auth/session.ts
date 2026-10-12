import "server-only"

import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { cache } from "react"

import { AppError } from "@/lib/errors"
import { ROUTES } from "@/lib/routes"

import { ADMIN_ROLES, hasAdminRole, type Role } from "./roles"

import { auth } from "./server"
import { getUserAccess } from "./user-access"

export type CurrentUser = {
  id: string
  username: string
  fullName: string
  email: string
  roles: Role[]
  /** ADMIN or PO: full administrative access to users, projects and requirements. */
  isAdmin: boolean
  mustChangePassword: boolean
}

/**
 * The signed-in user with their roles, or `null` when there is no valid session.
 * Deduplicated per request with React `cache`; roles and flags come from the cached
 * `getUserAccess`. Reads cookies, so callers must sit inside
 * a `<Suspense>` boundary. Database errors propagate to the nearest `error.tsx` on purpose:
 * an outage must not look like being signed out.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return null

  const access = await getUserAccess(session.user.id)
  // Deactivation revokes sessions, but treat a race as signed out too.
  if (!access || access.deactivated) return null

  return {
    id: session.user.id,
    username: session.user.displayUsername ?? session.user.username ?? "",
    fullName: session.user.name,
    email: session.user.email,
    roles: access.roles,
    isAdmin: hasAdminRole(access.roles),
    mustChangePassword: access.mustChangePassword,
  }
})

/**
 * Returns the signed-in user. Redirects to `/login` without a session, and to
 * `/change-password` while the user still has to replace an admin-issued password.
 */
export async function requireUser() {
  const user = await getCurrentUser()
  if (!user) redirect(ROUTES.login)
  if (user.mustChangePassword) redirect(ROUTES.changePassword)
  return user
}

/**
 * Returns the signed-in user if they hold at least one of `allowed` roles (users can hold
 * several, e.g. ADMIN + DEVELOPER). Redirects like `requireUser()`.
 * @throws {AppError} `FORBIDDEN` when none of the user's roles is allowed.
 */
export async function requireRole(...allowed: Role[]) {
  const user = await requireUser()
  if (!user.roles.some((role) => allowed.includes(role))) {
    throw new AppError("FORBIDDEN", "You don't have permission to do this.")
  }
  return user
}

/** `requireRole` for administrative actions (FRS RBAC: Admin / PO). */
export function requireAdmin() {
  return requireRole(...ADMIN_ROLES)
}

/**
 * For admin pages: returns the signed-in Admin/PO, or redirects everyone else to My Tasks.
 * Call it in the page or loader that reads admin data, not only in a layout: layouts and
 * pages render in parallel, so a layout check alone doesn't stop the page from streaming.
 */
export async function requireAdminPage() {
  const user = await requireUser()
  if (!user.isAdmin) redirect(ROUTES.myTasks)
  return user
}

/**
 * The signed-in user's id, checked against the sessions table (bypassing the session cookie
 * cache), or `null`. Use it for actions that must not run on a just-revoked session, e.g.
 * setting a password after an admin reset signed the user out everywhere.
 */
export async function getVerifiedUserId() {
  const session = await auth.api.getSession({ headers: await headers(), query: { disableCookieCache: true } })
  return session?.user.id ?? null
}

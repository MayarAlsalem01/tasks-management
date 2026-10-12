import type { userRoleEnum } from "@/lib/db/schema"

export type Role = (typeof userRoleEnum.enumValues)[number]

/** Role values by name, for checks in code (mirrors the `user_role` DB enum). */
export const Role = {
  Admin: "ADMIN",
  Po: "PO",
  Developer: "DEVELOPER",
  Qa: "QA",
} as const satisfies Record<string, Role>

/** Display order for roles everywhere in the UI. */
export const ROLES: Role[] = ["ADMIN", "PO", "DEVELOPER", "QA"]

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Admin",
  PO: "Product Owner",
  DEVELOPER: "Developer",
  QA: "QA Engineer",
}

/** What each role can do (FRS §2), shown in the admin user form. */
export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  ADMIN: "Full control: manages users, projects, requirements and assignments, and can perform every dev and QA action.",
  PO: "Same access as Admin: owns requirement scope, priorities and spec status, and can override Dev done.",
  DEVELOPER: "Moves FRs between Not started, In progress and Blocked, checks off Dev done on ACs, adds notes, PRs and comments.",
  QA: "Sets QA status, marks ACs passed or reports defects, adds notes, PRs and comments.",
}

/** Roles with full administrative access (FRS RBAC "Admin / PO"); they can see every project. */
export const ADMIN_ROLES: Role[] = ["ADMIN", "PO"]

export function hasAdminRole(roles: readonly Role[]) {
  return roles.some((role) => ADMIN_ROLES.includes(role))
}

/** "Admin · Developer" style label, in `ROLES` order. */
export function formatRoles(roles: readonly Role[]) {
  return ROLES.filter((role) => roles.includes(role))
    .map((role) => ROLE_LABELS[role])
    .join(" · ")
}

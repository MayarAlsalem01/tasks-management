import { hasAdminRole, Role } from "@/lib/auth/roles"

import type { FrRow } from "../types/requirement"
import { SpecStatus } from "../types/status"

/** What a user may do on FRs in a project they can open (FRS §2 RBAC, Role Variants spec). */
export type FrPermissions = {
  /** Admin/PO: scope, text, metadata, assignees, ACs, archive, Dev-Done override. */
  canManage: boolean
  /** Dev status and AC "Dev done". */
  canEditDev: boolean
  /** QA status, AC "QA passed" and defect reports. */
  canEditQa: boolean
}

export function frPermissions(roles: readonly Role[]): FrPermissions {
  const admin = hasAdminRole(roles)
  return {
    canManage: admin,
    canEditDev: admin || roles.includes(Role.Developer),
    canEditQa: admin || roles.includes(Role.Qa),
  }
}

/** Result of asking "may this user set Dev status to Done right now?" (FR-WKF-001). */
export type DoneGate =
  | { kind: "allowed" }
  /** ACs are pending, but an Admin/PO may override with confirmation. */
  | { kind: "override"; pending: number; total: number }
  /** ACs are pending and the user can't override (Developers), or can't edit dev at all. */
  | { kind: "blocked"; pending: number; total: number }

/**
 * Dev-Done gating (FR-WKF-001): Done needs every AC dev-done; Admin/PO may override. An FR
 * without ACs counts as complete. The UI and the server both decide through this function.
 */
export function devDoneGate(acs: readonly { devDone: boolean }[], permissions: FrPermissions): DoneGate {
  const pending = acs.filter((ac) => !ac.devDone).length
  if (!permissions.canEditDev) return { kind: "blocked", pending, total: acs.length }
  if (pending === 0) return { kind: "allowed" }
  return permissions.canManage
    ? { kind: "override", pending, total: acs.length }
    : { kind: "blocked", pending, total: acs.length }
}

/**
 * Why starting work needs a second look (FR-WKF-003): open issues or a spec still pending
 * review don't block In progress, but the user is warned. `undefined` when there's nothing to say.
 */
export function inProgressWarning(fr: Pick<FrRow, "openIssues" | "spec">) {
  if (fr.openIssues) return "Has open issues. You can start, but check them first."
  if (fr.spec === SpecStatus.PendingReview) return "Spec is pending review. You can start; text may still change."
  return undefined
}

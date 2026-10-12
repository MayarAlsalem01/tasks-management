"use client"

import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"

import { useQueryFlag } from "@/hooks/use-query-flag"
import { SearchParam } from "@/lib/routes"

import type { AdminUserRow, ProjectOption } from "../types/user"
import { ResetPasswordDialog } from "./reset-password-dialog"
import { UserFormDialog } from "./user-form-dialog"
import { UserStatusDialog } from "./user-status-dialog"
import { UsersTable } from "./users-table"

type RowDialog = { kind: "edit" | "status" | "reset"; user: AdminUserRow } | null

/**
 * Owns which admin user dialog is open and renders the Users table. The New user dialog is
 * driven by the `?new=1` URL flag (the header's "New user" link); row dialogs are local state.
 */
export function UsersManager({
  rows,
  projects,
  filtered,
}: {
  rows: AdminUserRow[]
  projects: ProjectOption[]
  filtered: boolean
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [creating, stopCreating] = useQueryFlag(SearchParam.New)
  const [dialog, setDialog] = useState<RowDialog>(null)

  return (
    <>
      <UsersTable
        rows={rows}
        onEdit={(user) => setDialog({ kind: "edit", user })}
        onToggleActive={(user) => setDialog({ kind: "status", user })}
        onClearFilters={filtered ? () => router.replace(pathname) : undefined}
      />
      {creating && (
        <UserFormDialog
          projects={projects}
          onClose={stopCreating}
          onToggleActive={(user) => setDialog({ kind: "status", user })}
          onResetPassword={(user) => setDialog({ kind: "reset", user })}
        />
      )}
      {dialog?.kind === "edit" && (
        <UserFormDialog
          user={dialog.user}
          projects={projects}
          onClose={() => setDialog(null)}
          onToggleActive={(user) => setDialog({ kind: "status", user })}
          onResetPassword={(user) => setDialog({ kind: "reset", user })}
        />
      )}
      {dialog?.kind === "status" && <UserStatusDialog user={dialog.user} onClose={() => setDialog(null)} />}
      {dialog?.kind === "reset" && <ResetPasswordDialog user={dialog.user} onClose={() => setDialog(null)} />}
    </>
  )
}

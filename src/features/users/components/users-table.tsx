"use client"

import { Button } from "@/components/ui/button"
import { UserAvatar } from "@/components/ui/user-avatar"
import { formatRoles, hasAdminRole } from "@/lib/auth/roles"
import { relativeTime } from "@/lib/format"

import type { AdminUserRow } from "../types/user"
import { USERS_GRID } from "../utils/table-layout"


function StatusPill({ deactivated }: { deactivated: boolean }) {
  return deactivated ? (
    <span className="inline-flex h-5 items-center gap-1.5 rounded-xs border border-gray-200 bg-gray-50 px-1.5 text-overline text-gray-700">
      <span className="size-1.5 rounded-full border-[1.5px] border-gray-500" />
      Deactivated
    </span>
  ) : (
    <span className="inline-flex h-5 items-center gap-1.5 rounded-xs bg-success-bg px-1.5 text-overline font-medium text-success-fg">
      <span className="size-1.5 rounded-full bg-success-solid" />
      Active
    </span>
  )
}

type UsersTableProps = {
  rows: AdminUserRow[]
  onEdit: (user: AdminUserRow) => void
  onToggleActive: (user: AdminUserRow) => void
  onClearFilters?: () => void
}

/** Admin Users table. Deactivated users stay listed with a dashed avatar and muted row. */
export function UsersTable({ rows, onEdit, onToggleActive, onClearFilters }: UsersTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-150">
      <div className="min-w-[1080px]">
        <div style={{ gridTemplateColumns: USERS_GRID }} className={`grid items-center gap-3 h-9 border-b border-gray-150 bg-gray-25 px-4 text-caption font-medium text-gray-600`}>
          <span>Name</span><span>Username</span><span>Email</span><span>Roles</span><span>Projects</span><span>Status</span><span>Last active</span><span />
        </div>
        {rows.map((user) => (
          <div key={user.id} style={{ gridTemplateColumns: USERS_GRID }} className={`grid items-center gap-3 h-12 border-b border-gray-75 px-4 last:border-b-0 hover:bg-gray-25 ${user.deactivated ? "bg-gray-25/40 opacity-80" : ""}`}>
            <span className="flex min-w-0 items-center gap-2">
              <UserAvatar userId={user.id} name={user.fullName} size="sm" deactivated={user.deactivated} />
              <span className={`truncate text-ui font-medium ${user.deactivated ? "text-gray-600" : ""}`}>{user.fullName}</span>
            </span>
            <span className="truncate font-mono text-caption text-gray-700">{user.username}</span>
            <span className="truncate text-caption text-gray-700">{user.email}</span>
            <span className="text-caption text-gray-700">{formatRoles(user.roles)}</span>
            <span className="flex flex-wrap gap-1">
              {(hasAdminRole(user.roles) ? [{ id: "all", code: "All" }] : user.projects).map((p) => (
                <span key={p.id} className="inline-flex h-4.5 items-center rounded-xs border border-gray-150 bg-gray-50 px-1.5 font-mono text-overline text-gray-700">
                  {p.code}
                </span>
              ))}
            </span>
            <span><StatusPill deactivated={user.deactivated} /></span>
            <span className="font-mono text-caption text-gray-600">{user.lastLoginAt ? relativeTime(user.lastLoginAt) : "Never"}</span>
            <span className="flex justify-end gap-0.5">
              <Button variant="ghost" size="sm" onClick={() => onEdit(user)}>Edit</Button>
              <Button
                variant="ghost"
                size="sm"
                className={user.deactivated ? "text-cobalt-600" : "text-danger-fg"}
                onClick={() => onToggleActive(user)}
              >
                {user.deactivated ? "Reactivate" : "Deactivate"}
              </Button>
            </span>
          </div>
        ))}
        {rows.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-6 py-10">
            <span className="text-body font-semibold">No users match these filters</span>
            {onClearFilters && <Button variant="outline" onClick={onClearFilters}>Clear filters</Button>}
          </div>
        )}
      </div>
    </div>
  )
}

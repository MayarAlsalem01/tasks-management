"use client"

import { cn } from "cn"

import { Checkbox } from "@/components/ui/checkbox"
import { ROLE_DESCRIPTIONS, ROLE_LABELS, ROLES, type Role } from "@/lib/auth/roles"

/**
 * Checkbox cards for the four roles; a user can hold several (e.g. Admin + Developer).
 * Selected roles are submitted as `roles` form values.
 */
export function RolePicker({
  value,
  onChange,
  error,
}: {
  value: Role[]
  onChange: (roles: Role[]) => void
  error?: string
}) {
  const toggle = (role: Role) => onChange(value.includes(role) ? value.filter((r) => r !== role) : [...value, role])

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-caption font-medium text-gray-700">Roles</legend>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {ROLES.map((role) => {
          const checked = value.includes(role)
          return (
            <label
              key={role}
              className={cn(
                "flex cursor-pointer items-start gap-2.5 rounded-lg border p-2.5 transition-colors",
                checked ? "border-cobalt-500 bg-cobalt-50 shadow-[inset_0_0_0_1px_var(--color-cobalt-500)]" : error ? "border-danger-solid" : "border-gray-200 hover:bg-gray-25",
              )}
            >
              <Checkbox name="roles" value={role} checked={checked} onCheckedChange={() => toggle(role)} className="mt-0.5" />
              <span className="flex flex-col gap-0.5">
                <span className="text-ui font-medium">{ROLE_LABELS[role]}</span>
                <span className="text-caption text-gray-600">{ROLE_DESCRIPTIONS[role]}</span>
              </span>
            </label>
          )
        })}
      </div>
      {error && <p className="text-caption text-danger-fg">{error}</p>}
    </fieldset>
  )
}

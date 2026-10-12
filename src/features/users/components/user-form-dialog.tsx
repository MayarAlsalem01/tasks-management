"use client"

import { useActionState, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TextField } from "@/components/ui/form-field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordStrength } from "@/components/ui/password-strength"
import { idleState, type ActionState } from "@/lib/action-state"
import { generatePassword } from "@/lib/auth/credentials"
import { hasAdminRole, type Role } from "@/lib/auth/roles"
import { relativeTime } from "@/lib/format"

import { createUserAction, updateUserAction } from "../actions/user-actions"
import type { AdminUserRow, ProjectOption } from "../types/user"
import { ProjectChecklist } from "./project-checklist"
import { RolePicker } from "./role-picker"

type UserFormDialogProps = {
  /** The user being edited; omit to create one. */
  user?: AdminUserRow
  projects: ProjectOption[]
  onClose: () => void
  onToggleActive: (user: AdminUserRow) => void
  onResetPassword: (user: AdminUserRow) => void
}

/** New user / Edit user dialog from the Admin design, with multi-role selection. */
export function UserFormDialog({ user, projects, onClose, onToggleActive, onResetPassword }: UserFormDialogProps) {
  const [roles, setRoles] = useState<Role[]>(user?.roles ?? [])
  const [projectIds, setProjectIds] = useState(user?.projects.map((p) => p.id) ?? [])
  const [password, setPassword] = useState("")

  const [state, formAction, pending] = useActionState(async (prev: ActionState, formData: FormData) => {
    const result = user ? await updateUserAction(user.id, prev, formData) : await createUserAction(prev, formData)
    if (result.status === "success") {
      toast.success(result.message)
      onClose()
    }
    return result
  }, idleState)
  const errors = state.fieldErrors ?? {}

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[calc(100svh-2rem)] overflow-y-auto sm:max-w-140">
        <DialogHeader>
          <DialogTitle>{user ? "Edit user" : "New user"}</DialogTitle>
          <DialogDescription>
            {user ? "Changes are recorded in the audit log." : "Accounts are created by admins. The user signs in with these details."}
          </DialogDescription>
        </DialogHeader>

        <form id="user-form" action={formAction} className="flex flex-col gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField id="fullName" name="fullName" label="Full name" defaultValue={user?.fullName} placeholder="e.g. Sofia Marin" error={errors.fullName} />
            {user ? (
              <div className="flex flex-col gap-1.5">
                <span className="text-caption font-medium text-gray-700">Username</span>
                <span className="flex h-8 items-center font-mono text-ui">{user.username}</span>
              </div>
            ) : (
              <TextField id="username" name="username" label="Username" placeholder="e.g. smarin" autoComplete="off" autoCapitalize="none" spellCheck={false} error={errors.username} />
            )}
          </div>
          <TextField id="email" name="email" type="email" label="Email" defaultValue={user?.email} placeholder="name@company.com" error={errors.email} />

          {user ? (
            <div className="flex items-center gap-3 rounded-lg border border-gray-150 bg-gray-25 px-3 py-2.5">
              <div className="flex flex-1 flex-col gap-0.5">
                <span className="text-ui font-medium">Password</span>
                <span className="text-caption text-gray-600">
                  {user.passwordChangedAt ? `Last changed ${relativeTime(user.passwordChangedAt).toLowerCase()}. ` : ""}
                  Resetting signs the user out everywhere.
                </span>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => onResetPassword(user)}>Reset password</Button>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between">
                <Label htmlFor="password" className="text-caption text-gray-700">Initial password</Label>
                <Button type="button" variant="link" size="sm" onClick={() => setPassword(generatePassword())}>Generate</Button>
              </div>
              <Input id="password" name="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className="font-mono" aria-invalid={!!errors.password || undefined} />
              <PasswordStrength password={password} />
              {errors.password && <p className="text-caption text-danger-fg">{errors.password}</p>}
              <p className="text-caption text-gray-600">Share it with the user securely. They&apos;ll be asked to change it at first sign-in.</p>
            </div>
          )}

          <RolePicker value={roles} onChange={setRoles} error={errors.roles} />
          <ProjectChecklist projects={projects} value={projectIds} onChange={setProjectIds} allAccess={hasAdminRole(roles)} error={errors.projectIds} />
          {state.status === "error" && !state.fieldErrors && <p className="text-caption text-danger-fg">{state.message}</p>}
        </form>

        <DialogFooter className="sm:justify-between">
          {user ? (
            <Button variant="ghost" className={user.deactivated ? "text-cobalt-600" : "text-danger-fg hover:bg-danger-bg"} onClick={() => onToggleActive(user)}>
              {user.deactivated ? "Reactivate user…" : "Deactivate user…"}
            </Button>
          ) : <span />}
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" form="user-form" loading={pending} disabled={pending}>
              {user ? "Save changes" : "Create user"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

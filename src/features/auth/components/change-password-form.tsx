"use client"

import { useActionState, useState } from "react"

import { Alert, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordStrength } from "@/components/ui/password-strength"
import { idleState } from "@/lib/action-state"

import { changePassword } from "../actions/change-password"
import { authButtonClass, authCardClass, authFieldClass, authLabelClass } from "./auth-layout"

/** New-password + confirmation form with a strength meter, for the forced first-login change. */
export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(changePassword, idleState)
  const [password, setPassword] = useState("")
  const errors = state.fieldErrors ?? {}

  return (
    <form action={formAction} className={authCardClass}>
      {state.status === "error" && !state.fieldErrors && (
        <Alert variant="destructive" className="border-danger-border bg-danger-bg text-danger-strong">
          <AlertTitle>{state.message}</AlertTitle>
        </Alert>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password" className={authLabelClass}>
          New password
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-invalid={!!errors.password || undefined}
          aria-describedby="password-error"
          className={authFieldClass}
        />
        <PasswordStrength password={password} />
        {errors.password && (
          <p id="password-error" className="text-caption text-danger-fg">
            {errors.password}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="confirm" className={authLabelClass}>
          Confirm new password
        </Label>
        <Input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
          aria-invalid={!!errors.confirm || undefined}
          aria-describedby="confirm-error"
          className={authFieldClass}
        />
        {errors.confirm && (
          <p id="confirm-error" className="text-caption text-danger-fg">
            {errors.confirm}
          </p>
        )}
      </div>

      <Button type="submit" loading={pending} disabled={pending} className={authButtonClass}>
        Save password
      </Button>
    </form>
  )
}

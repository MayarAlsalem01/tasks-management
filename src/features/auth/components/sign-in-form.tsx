"use client"

import { useActionState, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { signIn } from "../actions/sign-in"
import { useCountdown } from "../hooks/use-countdown"
import type { SignInState } from "../types/sign-in"
import {
  authButtonClass,
  authCardClass,
  authFieldClass as fieldClass,
  authLabelClass as labelClass,
} from "./auth-layout"
import { SignInAlert } from "./sign-in-alerts"

const initialState: SignInState = { status: "idle" }

/**
 * Username/password form for the sign-in screen. Renders the Invalid, Locked (with a live
 * countdown) and Deactivated states from the `signIn` action and disables input while locked.
 */
export function SignInForm() {
  const [state, formAction, pending] = useActionState(signIn, initialState)
  const [username, setUsername] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const secondsLeft = useCountdown(state.status === "locked" ? state.retryAfterSeconds : null)

  const locked = state.status === "locked" && secondsLeft > 0
  const disabled = locked || state.status === "deactivated"
  const invalid = state.status === "invalid"

  return (
    <form action={formAction} className={authCardClass}>
      <SignInAlert state={state} secondsLeft={secondsLeft} />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="username" className={labelClass}>
          Username
        </Label>
        <Input
          id="username"
          name="username"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          className={fieldClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between">
          <Label htmlFor="password" className={labelClass}>
            Password
          </Label>
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            aria-controls="password"
            aria-pressed={showPassword}
            className="rounded-xs font-medium text-cobalt-600 outline-none focus-visible:shadow-focus max-sm:text-ui sm:text-caption"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        <Input
          id="password"
          name="password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          required
          disabled={disabled}
          aria-invalid={invalid || undefined}
          className={fieldClass}
        />
      </div>

      <Button
        type="submit"
        loading={pending}
        disabled={disabled || pending}
        className={authButtonClass}
      >
        Sign in
      </Button>

      {disabled && (
        <p className="text-center text-caption text-gray-600">
          {locked
            ? "Sign-in is paused until the timer ends."
            : "Sign-in is unavailable for this account."}
        </p>
      )}
    </form>
  )
}

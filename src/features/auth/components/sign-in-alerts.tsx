import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

import type { SignInState } from "../types/sign-in"

function ErrorGlyph() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden>
      <circle cx="8" cy="8" r="7" fill="currentColor" />
      <path d="M8 4.4v4" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="8" cy="11" r="0.95" fill="#fff" />
    </svg>
  )
}

function LockGlyph() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect x="3" y="7" width="10" height="7" rx="1.8" fill="currentColor" />
      <path d="M5.2 7V5.2a2.8 2.8 0 0 1 5.6 0V7" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function BlockedGlyph() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="6.2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3.8 12.2l8.4-8.4" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function formatCountdown(seconds: number) {
  const m = String(Math.floor(seconds / 60)).padStart(2, "0")
  const s = String(seconds % 60).padStart(2, "0")
  return `${m}:${s}`
}

const dangerAlert = "border-danger-border bg-danger-bg text-danger-strong *:[svg]:text-danger-solid"

/** The alert above the sign-in fields for the current `SignInState`; nothing when idle. */
export function SignInAlert({ state, secondsLeft }: { state: SignInState; secondsLeft: number }) {
  switch (state.status) {
    case "invalid":
      return (
        <Alert variant="destructive" className={dangerAlert}>
          <ErrorGlyph />
          <AlertTitle>Incorrect username or password</AlertTitle>
          <AlertDescription className="text-danger-strong">
            {state.attemptsLeft === 1 ? "1 attempt" : `${state.attemptsLeft} attempts`} remaining
            before your account is temporarily locked.
          </AlertDescription>
        </Alert>
      )
    case "locked":
      if (secondsLeft === 0) return null
      return (
        <Alert variant="warning" className="*:[svg]:text-warning-solid">
          <LockGlyph />
          <AlertTitle>Account temporarily locked</AlertTitle>
          <AlertDescription className="flex flex-col items-start gap-1.5">
            <span>Too many failed sign-in attempts. You can try again in</span>
            <span
              role="timer"
              className="rounded-md border border-warning-border bg-white px-2.5 py-0.5 font-mono text-xl font-semibold"
            >
              {formatCountdown(secondsLeft)}
            </span>
            <span className="text-caption">
              Locked users can also ask an administrator to unlock the account.
            </span>
          </AlertDescription>
        </Alert>
      )
    case "deactivated":
      return (
        <Alert className="border-gray-200 bg-gray-50 *:[svg]:text-gray-700">
          <BlockedGlyph />
          <AlertTitle>This account is deactivated</AlertTitle>
          <AlertDescription className="text-gray-700">
            Your history is kept, but you can&apos;t sign in. Contact your administrator to have
            access restored.
          </AlertDescription>
        </Alert>
      )
    case "error":
      return (
        <Alert variant="destructive" className={dangerAlert}>
          <ErrorGlyph />
          <AlertTitle>{state.message}</AlertTitle>
        </Alert>
      )
    default:
      return null
  }
}

"use client"

import { useEffect } from "react"

import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { logError } from "@/lib/errors"

type ErrorStateProps = {
  error: Error & { digest?: string }
  retry: () => void
  /** Where the error was caught, used as the log context. */
  context: string
}

/** Fallback UI for route error boundaries: logs the error once and offers a retry. */
function ErrorState({ error, retry, context }: ErrorStateProps) {
  useEffect(() => {
    logError(error, context, error.digest ? { digest: error.digest } : undefined)
  }, [error, context])

  return (
    <EmptyState
      icon={
        <svg viewBox="0 0 16 16" aria-hidden>
          <circle cx="8" cy="8" r="7" fill="currentColor" />
          <path d="M8 4.4v4" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="8" cy="11" r="0.95" fill="#fff" />
        </svg>
      }
      title="Something went wrong"
      description="This page couldn't load. Try again, and contact your administrator if it keeps happening."
      action={<Button onClick={retry}>Try again</Button>}
      className="w-full max-w-100 [&>span:first-child]:text-danger-solid"
    />
  )
}

export { ErrorState }

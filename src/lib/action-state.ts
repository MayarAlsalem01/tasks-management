import { unstable_rethrow } from "next/navigation"
import type { z } from "zod"

import { GENERIC_ERROR_MESSAGE, isAppError, logError } from "@/lib/errors"

/**
 * The one result shape every form Server Action returns (used with `useActionState`).
 * `fieldErrors` maps a form field name to its message; `message` is for form-level errors
 * or a success notice.
 */
export type ActionState = {
  status: "idle" | "success" | "error"
  message?: string
  fieldErrors?: Record<string, string>
}

export const idleState: ActionState = { status: "idle" }

/** First error message per field from a failed zod parse. */
export function fieldErrorsFrom(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {}
  for (const issue of error.issues) {
    const field = issue.path.join(".") || "form"
    fieldErrors[field] ??= issue.message
  }
  return fieldErrors
}

/** An error state for a failed zod parse. */
export function validationErrorState(error: z.ZodError): ActionState {
  return { status: "error", message: "Check the highlighted fields.", fieldErrors: fieldErrorsFrom(error) }
}

/**
 * Turns an error caught in a Server Action into an `ActionState`. Rethrows Next.js control
 * flow (`redirect`, `notFound`); returns an `AppError`'s safe message (inline on its `field`
 * when set); logs anything unexpected under `context` and returns the generic message.
 */
export function actionErrorState(error: unknown, context: string): ActionState {
  unstable_rethrow(error)
  if (isAppError(error)) {
    return {
      status: "error",
      message: error.message,
      ...(error.field ? { fieldErrors: { [error.field]: error.message } } : {}),
    }
  }
  logError(error, context)
  return { status: "error", message: GENERIC_ERROR_MESSAGE }
}

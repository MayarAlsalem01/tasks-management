/**
 * The app's single error-handling path. Throw `AppError` for expected failures,
 * report everything else with `logError`, and show users `toUserMessage(error)`.
 */

export type AppErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION"
  | "CONFLICT"
  | "INTERNAL"

/** Generic message for unexpected failures; never expose internal error text to users. */
export const GENERIC_ERROR_MESSAGE = "Something went wrong. Please try again."

/**
 * An expected, user-facing failure. `message` must be safe to show in the UI;
 * put internal details in `cause` so they reach the logs but not the client.
 */
export class AppError extends Error {
  readonly code: AppErrorCode
  /** Form field the error belongs to (e.g. "username"), so forms can show it inline. */
  readonly field?: string

  constructor(code: AppErrorCode, message: string, options?: { cause?: unknown; field?: string }) {
    super(message, options)
    this.name = "AppError"
    this.code = code
    this.field = options?.field
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}

/**
 * Reports an error with where it happened. This is the one place to plug in an
 * error tracker (Sentry etc.) later; call it from every `catch` that doesn't rethrow.
 */
export function logError(error: unknown, context: string, details?: Record<string, unknown>) {
  console.error(`[${context}]`, error, ...(details ? [details] : []))
}

/** A message that is safe to show to users: an `AppError`'s own message, otherwise the generic one. */
export function toUserMessage(error: unknown) {
  return isAppError(error) ? error.message : GENERIC_ERROR_MESSAGE
}

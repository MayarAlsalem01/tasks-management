/** Consecutive failed sign-ins allowed before the account is locked (FR-IAM-002). */
export const MAX_FAILED_ATTEMPTS = 5
/** How long a locked account stays locked. */
export const LOCK_MINUTES = 15

export function isLocked(lockedUntil: Date | null, now: Date) {
  return lockedUntil !== null && lockedUntil > now
}

/**
 * What happens once a user has `failedCount` consecutive failed attempts: either how many
 * attempts are left, or the time the account stays locked until.
 */
export function failureOutcome(failedCount: number, now: Date) {
  if (failedCount < MAX_FAILED_ATTEMPTS) {
    return { lockedUntil: null, attemptsLeft: MAX_FAILED_ATTEMPTS - failedCount }
  }
  return { lockedUntil: new Date(now.getTime() + LOCK_MINUTES * 60_000), attemptsLeft: 0 }
}

/** Whole seconds from `now` until `date`, never negative. */
export function secondsUntil(date: Date, now: Date) {
  return Math.max(0, Math.ceil((date.getTime() - now.getTime()) / 1000))
}

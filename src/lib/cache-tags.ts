/**
 * Every `cacheTag` in the app. Cached reads tag themselves with these; Server Actions
 * invalidate them through each feature's `cache/revalidate.ts`. Tags are deliberately broad
 * (one per domain) so a write never leaves a dependent view stale.
 */
export const CacheTag = {
  /** Projects, their membership, archive state and activity/step trees. */
  Projects: "projects",
  /** Users, roles, status and sign-in metadata. */
  Users: "users",
  /** Functional requirements, ACs and assignments (counts, progress, My Tasks). */
  Requirements: "requirements",
} as const

export type CacheTag = (typeof CacheTag)[keyof typeof CacheTag]

/** One user's notifications, so marking read only refreshes that user's feed. */
export function notificationsTag(userId: string) {
  return `notifications:${userId}`
}

/**
 * `cacheLife` profiles by kind of data. Tagged data is invalidated on write, so these
 * lifetimes only bound staleness from writes made outside the app (e.g. scripts).
 */
export const CacheProfile = {
  /** Projects, users, trees and admin lists: change only through admin actions. */
  Reference: "hours",
  /** Notification feeds: written by other users' actions. */
  Feed: "minutes",
} as const

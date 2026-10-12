import "server-only"

import { cacheLife, cacheTag } from "next/cache"

import { CacheProfile, CacheTag } from "@/lib/cache-tags"

import { getFrDetail } from "../actions/requirement-detail-queries"
import { listProjectPeople, listProjectRequirements } from "../actions/requirement-queries"

// Cached readers for the requirements feature. Callers check project access first: these
// are keyed by ids only and return data for anyone who asks.

/** Every FR of a project with ACs and assignees (the table and the drawer's first tabs). */
export async function getProjectRequirements(projectId: string) {
  "use cache"
  cacheTag(CacheTag.Requirements, CacheTag.Users)
  cacheLife(CacheProfile.Reference)
  return listProjectRequirements(projectId)
}

/** People who can be assigned in a project, with roles (members plus admins). */
export async function getProjectPeople(projectId: string) {
  "use cache"
  cacheTag(CacheTag.Projects, CacheTag.Users)
  cacheLife(CacheProfile.Reference)
  return listProjectPeople(projectId)
}

/** Comments, PRs and audit history of one FR (the drawer's Discussion and Audit tabs). */
export async function getCachedFrDetail(frId: string) {
  "use cache"
  cacheTag(CacheTag.Requirements, CacheTag.Users)
  cacheLife(CacheProfile.Reference)
  return getFrDetail(frId)
}

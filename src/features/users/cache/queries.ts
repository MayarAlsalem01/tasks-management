import "server-only"

import { cacheLife, cacheTag } from "next/cache"

import { CacheProfile, CacheTag } from "@/lib/cache-tags"

import { countUsersByStatus, listProjectOptions, listUsers } from "../actions/user-queries"
import type { UserFilters } from "../types/user"

// Cached readers for the users feature. Pages import these, never the raw queries.

/** Users table rows for a filter combination (each combination is its own cache entry). */
export async function getUsers(filters: UserFilters) {
  "use cache"
  cacheTag(CacheTag.Users, CacheTag.Projects)
  cacheLife(CacheProfile.Reference)
  return listUsers(filters)
}

export async function getUserCounts() {
  "use cache"
  cacheTag(CacheTag.Users)
  cacheLife(CacheProfile.Reference)
  return countUsersByStatus()
}

export async function getProjectOptions() {
  "use cache"
  cacheTag(CacheTag.Projects)
  cacheLife(CacheProfile.Reference)
  return listProjectOptions()
}

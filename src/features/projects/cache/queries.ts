import "server-only"

import { cacheLife, cacheTag } from "next/cache"

import { CacheProfile, CacheTag } from "@/lib/cache-tags"

import { listAdminProjects, listMemberOptions } from "../actions/project-admin-queries"
import {
  countArchivedProjects,
  getProjectNav,
  listAccessibleProjects,
  listProjectNavs,
} from "../actions/project-queries"
import type { ProjectSummary } from "../types/project"

// Cached readers for the projects feature. Pages and loaders import these, never the raw
// queries in ../actions. Arguments are plain values because they form the cache key.

/** Projects the user can open, with "mine" counts. Keyed by user id and admin flag. */
export async function getAccessibleProjects(userId: string, isAdmin: boolean) {
  "use cache"
  cacheTag(CacheTag.Projects, CacheTag.Requirements)
  cacheLife(CacheProfile.Reference)
  return listAccessibleProjects({ id: userId, isAdmin })
}

export async function getArchivedProjectCount() {
  "use cache"
  cacheTag(CacheTag.Projects)
  cacheLife(CacheProfile.Reference)
  return countArchivedProjects()
}

/** Activities → Steps trees for the given projects (the sidebar). */
export async function getProjectNavs(projects: Pick<ProjectSummary, "id" | "code" | "name">[]) {
  "use cache"
  cacheTag(CacheTag.Projects, CacheTag.Requirements)
  cacheLife(CacheProfile.Reference)
  return listProjectNavs(projects)
}

/** One project's tree, or `null` when missing or not accessible to this user. */
export async function getProjectNavForUser(code: string, userId: string, isAdmin: boolean) {
  "use cache"
  cacheTag(CacheTag.Projects, CacheTag.Requirements)
  cacheLife(CacheProfile.Reference)
  return getProjectNav(code, { id: userId, isAdmin })
}

/** Admin Projects table rows for one tab. Depends on users too (team names, deactivation). */
export async function getAdminProjects(archived: boolean) {
  "use cache"
  cacheTag(CacheTag.Projects, CacheTag.Users, CacheTag.Requirements)
  cacheLife(CacheProfile.Reference)
  return listAdminProjects(archived)
}

export async function getMemberOptions() {
  "use cache"
  cacheTag(CacheTag.Users)
  cacheLife(CacheProfile.Reference)
  return listMemberOptions()
}

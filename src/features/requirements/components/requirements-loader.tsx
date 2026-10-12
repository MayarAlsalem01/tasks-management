import "server-only"

import { notFound } from "next/navigation"
import type * as React from "react"

import { getProjectNavForUser } from "@/features/projects/server"
import { requireUser } from "@/lib/auth/session"

import { getProjectPeople, getProjectRequirements } from "../cache/queries"
import type { RequirementsViewProps } from "./requirements-workspace"

/**
 * Loads a project view's data (project tree, FRs, assignable people, viewer) and renders
 * `view` with it. 404s for missing projects and non-members alike. Reads the session and
 * params, so it must sit inside `<Suspense>`.
 */
export async function RequirementsLoader({ params, view: View }: { params: Promise<{ code: string }>; view: React.ComponentType<RequirementsViewProps> }) {
  const [{ code }, user] = await Promise.all([params, requireUser()])
  const project = await getProjectNavForUser(code, user.id, user.isAdmin)
  if (!project) notFound()
  const [rows, people] = await Promise.all([getProjectRequirements(project.id), getProjectPeople(project.id)])
  return <View project={project} rows={rows} people={people} viewer={{ fullName: user.fullName, roles: user.roles }} />
}

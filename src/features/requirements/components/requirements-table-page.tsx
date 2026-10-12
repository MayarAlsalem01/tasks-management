import { notFound } from "next/navigation"
import { Suspense } from "react"

import { getProjectNavForUser } from "@/features/projects/server"
import { requireUser } from "@/lib/auth/session"

import { getProjectPeople, getProjectRequirements } from "../cache/queries"
import { RequirementsSkeleton } from "./requirements-skeleton"
import { RequirementsView } from "./requirements-view"

async function RequirementsLoader({ params }: { params: Promise<{ code: string }> }) {
  const [{ code }, user] = await Promise.all([params, requireUser()])
  // Checks project access too: `null` for missing projects and non-members alike.
  const project = await getProjectNavForUser(code, user.id, user.isAdmin)
  if (!project) notFound()
  const [rows, people] = await Promise.all([getProjectRequirements(project.id), getProjectPeople(project.id)])
  return <RequirementsView project={project} rows={rows} people={people} viewer={{ fullName: user.fullName, roles: user.roles }} />
}

/**
 * Project › Table view. Everything here depends on the session and the project, so it all
 * streams behind a skeleton shaped like the toolbar and grid; the page header above it is
 * rendered by the project layout.
 */
export function RequirementsTablePage({ params }: { params: Promise<{ code: string }> }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Suspense fallback={<RequirementsSkeleton />}>
        <RequirementsLoader params={params} />
      </Suspense>
    </div>
  )
}

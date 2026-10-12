import "server-only"

import { Suspense } from "react"

import { requireUser } from "@/lib/auth/session"

import { getMyTasks, getProjectPeople, getUnassignedFrs } from "../cache/queries"
import type { ProjectPerson } from "../types/requirement"
import { MyTasksSkeleton } from "./my-tasks-skeleton"
import { MyTasksView } from "./my-tasks-view"

/**
 * Loads the viewer's tasks and, for Admin/PO, the unassigned FRs with each of their projects'
 * assignable people. Reads the session, so it must sit inside `<Suspense>`.
 */
async function MyTasksLoader() {
  const user = await requireUser()
  const [tasks, unassigned] = await Promise.all([getMyTasks(user.id, user.isAdmin), user.isAdmin ? getUnassignedFrs() : []])
  const projectIds = [...new Set(unassigned.map((fr) => fr.projectId))]
  const people = await Promise.all(projectIds.map((id) => getProjectPeople(id)))
  const peopleByProject: Record<string, ProjectPerson[]> = Object.fromEntries(projectIds.map((id, i) => [id, people[i]]))
  return <MyTasksView tasks={tasks} unassigned={unassigned} peopleByProject={peopleByProject} viewer={{ fullName: user.fullName, roles: user.roles }} />
}

/** My Tasks body: everything depends on the session, so it streams behind a matching skeleton. */
export function MyTasksPage() {
  return (
    <Suspense fallback={<MyTasksSkeleton />}>
      <MyTasksLoader />
    </Suspense>
  )
}

/** "12 FRs · 3 projects" for the page header. Reads the session: wrap in `<Suspense>`. */
export async function MyTasksMeta() {
  const user = await requireUser()
  const tasks = await getMyTasks(user.id, user.isAdmin)
  const projects = new Set(tasks.map((t) => t.project.id)).size
  return `${tasks.length} ${tasks.length === 1 ? "FR" : "FRs"} · ${projects} ${projects === 1 ? "project" : "projects"}`
}

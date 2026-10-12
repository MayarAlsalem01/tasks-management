"use client"

import { SquareCheckIcon } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useState } from "react"

import { EmptyState } from "@/components/ui/empty-state"
import type { Role } from "@/lib/auth/roles"
import { ROUTES, SearchParam } from "@/lib/routes"

import { useFrMutations } from "../hooks/use-fr-mutations"
import { useStatusFlow } from "../hooks/use-status-flow"
import { TaskVariant, type MyTask, type UnassignedFr } from "../types/my-tasks"
import type { ProjectPerson } from "../types/requirement"
import { todayIso } from "../utils/dates"
import { focusItems, groupTasks, parseTaskGroup, taskTiles, taskVariant, type QuickAction } from "../utils/my-tasks"
import { frPermissions } from "../utils/permissions"
import { FrActionsProvider } from "./fr-context"
import { MyTasksFocus } from "./my-tasks-focus"
import { MyTasksTable } from "./my-tasks-table"
import { MyTasksTiles } from "./my-tasks-tiles"
import { UnassignedFrs } from "./unassigned-frs"
import { ConfirmPassedDialog, OverrideDialog } from "./workflow-dialogs"

export type MyTasksViewProps = {
  tasks: MyTask[]
  unassigned: UnassignedFr[]
  peopleByProject: Record<string, ProjectPerson[]>
  viewer: { fullName: string; roles: Role[] }
}

const FOCUS_COPY = {
  [TaskVariant.Developer]: { title: "Needs your attention", subtitle: "Blocked items and recent QA failures" },
  [TaskVariant.Qa]: { title: "Ready for testing", subtitle: "Dev status is Done and QA has not started" },
}

const EMPTY_COPY: Record<TaskVariant, string> = {
  admin: "FRs you take on as developer or QA appear here. Use Unassigned FRs above to hand work to the team.",
  developer: "When an Admin or Product Owner assigns you a requirement, it will appear here across all your projects.",
  qa: "When an Admin or Product Owner assigns you as QA on a requirement, it will appear here. FRs ready for testing are highlighted first.",
}

/**
 * My Tasks: the viewer's FRs across projects with tiles, a focus strip (Developer / QA), the
 * Admin/PO Unassigned FRs panel and the grouped task table. Edits run through the same
 * optimistic mutation path and status workflow (FR-WKF-001/002) as the project views.
 */
export function MyTasksView({ tasks: serverTasks, unassigned, peopleByProject, viewer }: MyTasksViewProps) {
  const { rows: tasks, run } = useFrMutations(serverTasks)
  const permissions = frPermissions(viewer.roles)
  const flow = useStatusFlow(run, permissions)
  const [open, setOpen] = useState<ReadonlySet<string>>(new Set())
  const groupBy = parseTaskGroup(useSearchParams().get(SearchParam.Group))
  const variant = taskVariant(viewer.roles)
  const today = todayIso()

  const expand = (frId: string, on = !open.has(frId)) => setOpen((prev) => (on ? new Set(prev).add(frId) : new Set([...prev].filter((id) => id !== frId))))
  const onQuick = (task: MyTask, action: QuickAction) => {
    if (action.kind === "expand") return expand(task.id, true)
    if (action.kind === "dev") return flow.requestDevStatus(task, action.status)
    flow.requestQaStatus(task, action.status)
  }
  const focus = focusItems(variant, tasks)

  return (
    <FrActionsProvider value={{ permissions, run, requestDevStatus: flow.requestDevStatus, requestQaStatus: flow.requestQaStatus }}>
      <div className="flex flex-col gap-4 px-4 py-4 lg:px-6">
        {(tasks.length > 0 || variant === TaskVariant.Admin) && <MyTasksTiles tiles={taskTiles(variant, tasks, unassigned.length, today)} />}
        {variant === TaskVariant.Admin && unassigned.length > 0 && <UnassignedFrs frs={unassigned} peopleByProject={peopleByProject} run={run} />}
        {variant !== TaskVariant.Admin && focus.length > 0 && <MyTasksFocus {...FOCUS_COPY[variant]} items={focus} onOpen={(id) => expand(id, true)} />}
        {tasks.length ? (
          <MyTasksTable
            groups={groupTasks(tasks, groupBy, today)}
            variant={variant}
            today={today}
            progressLabel={variant === TaskVariant.Qa ? "QA progress" : "Dev progress"}
            isOpen={(id) => open.has(id)}
            onToggle={(id) => expand(id)}
            onQuick={onQuick}
          />
        ) : (
          <EmptyState
            icon={<SquareCheckIcon />}
            title="Nothing assigned to you"
            description={EMPTY_COPY[variant]}
            className="py-16"
            action={<Link href={ROUTES.projects} className="text-ui font-medium text-cobalt-600 hover:text-cobalt-700 hover:underline">Browse project tables</Link>}
          />
        )}
      </div>
      {flow.overrideFr && <OverrideDialog fr={flow.overrideFr} actorName={viewer.fullName} onConfirm={flow.confirmOverride} onClose={flow.closeDialogs} />}
      {flow.confirmPassedFr && <ConfirmPassedDialog fr={flow.confirmPassedFr} onConfirm={flow.confirmPassed} onClose={flow.closeDialogs} />}
    </FrActionsProvider>
  )
}

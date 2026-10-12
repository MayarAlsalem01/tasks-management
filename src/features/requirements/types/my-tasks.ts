import type { AcRow, FrRow, Person } from "./requirement"
import type { Priority } from "./status"

/** An AC on My Tasks: the table's AC plus the latest defect note while it's failed. */
export type TaskAc = AcRow & { defectNote: string | null }

/** An FR assigned to the viewer, from any project they can open. */
export type MyTask = Omit<FrRow, "acs"> & {
  acs: TaskAc[]
  project: { id: string; code: string; name: string }
  /** Latest defect report on any of its ACs that hasn't passed since. */
  qaFailedAt: Date | null
}

/** An active FR still missing a developer or a QA engineer (Admin/PO panel). */
export type UnassignedFr = {
  id: string
  code: string
  title: string
  priority: Priority
  /** `YYYY-MM-DD` */
  targetDate: string | null
  projectId: string
  developers: Person[]
  qaEngineers: Person[]
}

/** Which My Tasks layout the viewer gets: their highest role decides. */
export const TaskVariant = { Admin: "admin", Developer: "developer", Qa: "qa" } as const
export type TaskVariant = (typeof TaskVariant)[keyof typeof TaskVariant]

/** How the My Tasks table groups rows (`SearchParam.Group`). */
export const TaskGroupBy = { Project: "project", Due: "due" } as const
export type TaskGroupBy = (typeof TaskGroupBy)[keyof typeof TaskGroupBy]

export const TASK_GROUP_LABEL: Record<TaskGroupBy, string> = { project: "Project", due: "Due date" }

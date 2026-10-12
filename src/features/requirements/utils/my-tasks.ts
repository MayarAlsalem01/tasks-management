import { z } from "zod"

import { hasAdminRole, Role } from "@/lib/auth/roles"
import { relativeTime } from "@/lib/format"
import { percent } from "@/lib/progress"

import { TaskGroupBy, TaskVariant, type MyTask } from "../types/my-tasks"
import { DevStatus, QaStatus, SpecStatus } from "../types/status"
import { formatIsoDate, overdueDays } from "./dates"

/** Column template shared by the My Tasks header, rows and skeleton. */
export const TASK_GRID = "28px 92px minmax(0,1fr) 50px 126px 112px 138px 96px 120px"

/** Admin/PO first, then Developer, then QA: the highest role picks the layout. */
export function taskVariant(roles: readonly Role[]): TaskVariant {
  if (hasAdminRole(roles)) return TaskVariant.Admin
  return roles.includes(Role.Developer) ? TaskVariant.Developer : TaskVariant.Qa
}

/** `?group=` for My Tasks; anything unknown falls back to Project. */
export function parseTaskGroup(value: string | null | undefined): TaskGroupBy {
  return z.enum(TaskGroupBy).catch(TaskGroupBy.Project).parse(value)
}

function addDays(iso: string, days: number) {
  return new Date(Date.parse(iso) + days * 86_400_000).toISOString().slice(0, 10)
}

export const isOverdue = (task: MyTask, today: string) => overdueDays(task.targetDate, task.dev === DevStatus.Done, today) > 0

export type TaskGroup = {
  key: string
  label: string
  tasks: MyTask[]
  /** Project code (project grouping) or a due-date tone dot. */
  badge: { kind: "project"; code: string } | { kind: "dot"; tone: "danger" | "warning" | "neutral" }
}

const DUE_BUCKETS = [
  { key: "overdue", label: "Overdue", tone: "danger" },
  { key: "week", label: "Due this week", tone: "warning" },
  { key: "later", label: "Later", tone: "neutral" },
] as const

function dueBucket(task: MyTask, today: string) {
  if (isOverdue(task, today)) return 0
  return task.targetDate && task.targetDate <= addDays(today, 7) ? 1 : 2
}

/** Splits tasks into project groups (in list order) or Overdue / Due this week / Later. Empty groups are dropped. */
export function groupTasks(tasks: MyTask[], groupBy: TaskGroupBy, today: string): TaskGroup[] {
  if (groupBy === TaskGroupBy.Project) {
    const groups = new Map<string, TaskGroup>()
    for (const task of tasks) {
      const group = groups.get(task.project.id) ?? { key: task.project.id, label: task.project.name, tasks: [], badge: { kind: "project", code: task.project.code } }
      group.tasks.push(task)
      groups.set(task.project.id, group)
    }
    return [...groups.values()]
  }
  const byDate = (a: MyTask, b: MyTask) => (a.targetDate ?? "9999").localeCompare(b.targetDate ?? "9999")
  return DUE_BUCKETS.map(({ key, label, tone }, i) => ({
    key,
    label,
    tasks: tasks.filter((t) => dueBucket(t, today) === i).sort(byDate),
    badge: { kind: "dot" as const, tone },
  })).filter((g) => g.tasks.length > 0)
}

export type TileTone = "neutral" | "danger" | "warning" | "info"
export type TaskTile = {
  label: string
  value: string | number
  sub: string
  tone: TileTone
  glyph?: { kind: "dev"; status: DevStatus } | { kind: "qa"; status: QaStatus }
}

const count = (tasks: MyTask[], test: (t: MyTask) => boolean) => tasks.filter(test).length
const readyForTesting = (t: MyTask) => t.dev === DevStatus.Done && t.qa === QaStatus.NotTested

/** The four summary tiles of each variant. */
export function taskTiles(variant: TaskVariant, tasks: MyTask[], unassignedCount: number, today: string): TaskTile[] {
  if (variant === TaskVariant.Developer) {
    return [
      { label: "In progress", value: count(tasks, (t) => t.dev === DevStatus.InProgress), sub: "FRs you are building", tone: "neutral", glyph: { kind: "dev", status: DevStatus.InProgress } },
      { label: "Blocked", value: count(tasks, (t) => t.dev === DevStatus.Blocked), sub: "Waiting on something", tone: "danger", glyph: { kind: "dev", status: DevStatus.Blocked } },
      { label: "Not started", value: count(tasks, (t) => t.dev === DevStatus.NotStarted), sub: "Ready to pick up", tone: "neutral", glyph: { kind: "dev", status: DevStatus.NotStarted } },
      { label: "Recently QA failed", value: count(tasks, (t) => t.qa === QaStatus.Failed), sub: "Fix and send back", tone: "danger", glyph: { kind: "qa", status: QaStatus.Failed } },
    ]
  }
  if (variant === TaskVariant.Qa) {
    const acs = tasks.flatMap((t) => t.acs)
    const passed = acs.filter((ac) => ac.qaPassed).length
    return [
      { label: "Ready for testing", value: count(tasks, readyForTesting), sub: "Dev Done, not yet tested", tone: "info", glyph: { kind: "dev", status: DevStatus.Done } },
      { label: "Recently failed", value: count(tasks, (t) => t.qa === QaStatus.Failed), sub: "Waiting for a fix", tone: "danger", glyph: { kind: "qa", status: QaStatus.Failed } },
      { label: "In development", value: count(tasks, (t) => t.dev !== DevStatus.Done), sub: "Not testable yet", tone: "neutral", glyph: { kind: "dev", status: DevStatus.InProgress } },
      { label: "AC QA progress", value: `${percent(passed, acs.length)}%`, sub: `${passed} of ${acs.length} ACs passed`, tone: "neutral", glyph: { kind: "qa", status: QaStatus.Passed } },
    ]
  }
  return [
    { label: "Assigned to me", value: tasks.length, sub: "As developer or QA", tone: "neutral", glyph: { kind: "dev", status: DevStatus.InProgress } },
    { label: "Unassigned FRs", value: unassignedCount, sub: "Need an owner", tone: "warning", glyph: { kind: "dev", status: DevStatus.NotStarted } },
    { label: "Pending review", value: count(tasks, (t) => t.spec === SpecStatus.PendingReview), sub: "Spec awaiting approval", tone: "neutral" },
    { label: "Overdue", value: count(tasks, (t) => isOverdue(t, today)), sub: "Past target date", tone: "neutral" },
  ]
}

export type FocusItem = { task: MyTask; tag: "blocked" | "failed" | "ready"; reason: string; action: string }

/** "Needs your attention" (Developer: blocked and QA-failed FRs) or "Ready for testing" (QA). Admin/PO get none. */
export function focusItems(variant: TaskVariant, tasks: MyTask[]): FocusItem[] {
  if (variant === TaskVariant.Qa) {
    return tasks.filter(readyForTesting).map((task) => ({
      task,
      tag: "ready",
      action: "Start testing",
      reason: `${task.acs.length} acceptance criteria to verify.${task.targetDate ? ` Due ${formatIsoDate(task.targetDate)}.` : ""}`,
    }))
  }
  if (variant !== TaskVariant.Developer) return []
  const blocked = tasks.filter((t) => t.dev === DevStatus.Blocked).map((task): FocusItem => ({
    task,
    tag: "blocked",
    action: "Review blocker",
    reason: task.notes ?? task.openIssues ?? "No reason recorded yet. Add a note so the team knows what's missing.",
  }))
  const failed = tasks.filter((t) => t.qa === QaStatus.Failed).map((task): FocusItem => ({ task, tag: "failed", action: "See defect", reason: failureNote(task) }))
  return [...blocked, ...failed]
}

function failedWhen(date: Date, now: Date) {
  const time = relativeTime(date, now)
  if (time === "Now") return "just now"
  if (time === "Yesterday") return "yesterday"
  return time.endsWith("ago") ? time : `on ${time}`
}

/** "QA failed 14m ago. <defect note>", for focus cards and the expanded row. */
export function failureNote(task: MyTask, now = new Date()) {
  const when = task.qaFailedAt ? `QA failed ${failedWhen(task.qaFailedAt, now)}` : "QA failed"
  const note = task.acs.find((ac) => ac.defectNote)?.defectNote
  return note ? `${when}. ${note}` : `${when}.`
}

export type QuickAction =
  | { kind: "dev"; label: string; status: DevStatus }
  | { kind: "qa"; label: string; status: QaStatus }
  | { kind: "expand"; label: string }

/**
 * The one-click next step for a row. Developer and Admin/PO: Start work, Unblock, Mark Done
 * (once every AC is dev-done). QA: Start testing, Re-test, Mark Passed (once every AC passed).
 */
export function quickAction(variant: TaskVariant, task: MyTask): QuickAction | null {
  if (variant === TaskVariant.Qa) {
    if (task.dev === DevStatus.Done && task.qa === QaStatus.NotTested) return { kind: "expand", label: "Start testing" }
    if (task.qa === QaStatus.Failed) return { kind: "qa", label: "Re-test", status: QaStatus.NotTested }
    if (task.acs.length && task.acs.every((ac) => ac.qaPassed) && task.qa !== QaStatus.Passed) return { kind: "qa", label: "Mark Passed", status: QaStatus.Passed }
    return null
  }
  if (task.dev === DevStatus.NotStarted) return { kind: "dev", label: "Start work", status: DevStatus.InProgress }
  if (task.dev === DevStatus.Blocked) return { kind: "dev", label: "Unblock", status: DevStatus.InProgress }
  if (task.dev === DevStatus.InProgress && task.acs.every((ac) => ac.devDone)) return { kind: "dev", label: "Mark Done", status: DevStatus.Done }
  return null
}

/** Dev progress for Developer and Admin/PO, QA progress for QA. */
export function taskProgress(variant: TaskVariant, task: MyTask) {
  const total = task.acs.length
  if (variant === TaskVariant.Qa) {
    const done = task.acs.filter((ac) => ac.qaPassed).length
    return { label: `QA ${done}/${total}`, value: percent(done, total), tone: task.qa === QaStatus.Failed ? "bg-danger-mark" : "bg-success-mark" }
  }
  const done = task.acs.filter((ac) => ac.devDone).length
  return { label: `Dev ${done}/${total}`, value: percent(done, total), tone: "bg-primary" }
}

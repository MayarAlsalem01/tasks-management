"use client"

import { cn } from "cn"

import { ProjectBadge } from "@/features/projects"

import type { MyTask, TaskVariant } from "../types/my-tasks"
import { TASK_GRID, type QuickAction, type TaskGroup } from "../utils/my-tasks"
import { TaskRow } from "./task-row"

const DOT = { danger: "bg-danger-fg", warning: "bg-warning-fg", neutral: "bg-gray-700" }

const HEADERS = ["", "ID", "Requirement", "Project", "Dev", "QA"]

type MyTasksTableProps = {
  groups: TaskGroup[]
  variant: TaskVariant
  today: string
  progressLabel: string
  isOpen: (frId: string) => boolean
  onToggle: (frId: string) => void
  onQuick: (task: MyTask, action: QuickAction) => void
}

/** The grouped My Tasks grid (by project or due date). Scrolls sideways on narrow screens. */
export function MyTasksTable({ groups, variant, today, progressLabel, isOpen, onToggle, onQuick }: MyTasksTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-150">
      <div className="min-w-[1000px]">
        <div style={{ gridTemplateColumns: TASK_GRID }} className="grid h-[34px] items-center gap-2.5 border-b border-gray-150 bg-gray-25 px-4 text-caption font-medium text-gray-600">
          {[...HEADERS, progressLabel, "Target", "Quick action"].map((h, i) => <span key={i}>{h}</span>)}
        </div>
        {groups.map((group) => (
          <div key={group.key}>
            <div className="flex h-[34px] items-center gap-2.5 border-b border-gray-150 bg-gray-50 px-4">
              <span className="text-ui font-semibold">{group.label}</span>
              <span className="font-mono text-overline tracking-normal text-gray-600">{group.tasks.length} {group.tasks.length === 1 ? "FR" : "FRs"}</span>
              {group.badge.kind === "project" ? (
                <ProjectBadge code={group.badge.code} size="md" />
              ) : (
                <span aria-hidden className={cn("size-2 rounded-full", DOT[group.badge.tone])} />
              )}
            </div>
            {group.tasks.map((task) => (
              <TaskRow key={task.id} task={task} variant={variant} today={today} open={isOpen(task.id)} onToggle={() => onToggle(task.id)} onQuick={onQuick} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

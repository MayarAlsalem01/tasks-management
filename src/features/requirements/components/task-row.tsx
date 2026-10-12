"use client"

import { cn } from "cn"
import { ChevronRightIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

import type { MyTask, TaskVariant } from "../types/my-tasks"
import { SpecStatus } from "../types/status"
import { formatIsoDate } from "../utils/dates"
import { isOverdue, quickAction, TASK_GRID, taskProgress, type QuickAction } from "../utils/my-tasks"
import { ProgressBar } from "./ac-progress"
import { useFrActions } from "./fr-context"
import { MenuTrigger } from "./menu-trigger"
import { DevStatusMenu, QaStatusMenu } from "./status-menus"
import { DevStatusPill, QaStatusPill } from "./status-pills"
import { TaskAcs } from "./task-acs"

type TaskRowProps = {
  task: MyTask
  variant: TaskVariant
  today: string
  open: boolean
  onToggle: () => void
  onQuick: (task: MyTask, action: QuickAction) => void
}

/**
 * One FR on My Tasks: inline Dev / QA status menus (when the viewer's roles allow), Dev or
 * QA progress, target date, and the row's quick action. Expands to its ACs.
 */
export function TaskRow({ task, variant, today, open, onToggle, onQuick }: TaskRowProps) {
  const { permissions } = useFrActions()
  const progress = taskProgress(variant, task)
  const late = isOverdue(task, today)
  const quick = quickAction(variant, task)

  return (
    <>
      <div style={{ gridTemplateColumns: TASK_GRID }} className={cn("grid min-h-11 items-center gap-2.5 border-b border-gray-75 px-4 py-1 text-ui", open ? "bg-gray-25" : "bg-white")}>
        <button
          type="button"
          aria-expanded={open}
          aria-label={`Show acceptance criteria of ${task.code}`}
          onClick={onToggle}
          className="inline-flex size-6 items-center justify-center rounded-[5px] outline-none hover:bg-gray-75 focus-visible:shadow-focus"
        >
          <ChevronRightIcon className={cn("size-3 text-gray-700 transition-transform", open && "rotate-90")} />
        </button>
        <span className="font-mono text-caption text-gray-700">{task.code}</span>
        <span className="flex min-w-0 items-center gap-2">
          <span title={task.title} className="truncate">{task.title}</span>
          {task.spec === SpecStatus.PendingReview && (
            <span className="inline-flex h-5 flex-none items-center rounded-xs bg-warning-bg px-1.5 text-[11px] font-medium text-warning-fg">Pending review</span>
          )}
        </span>
        <span className="font-mono text-overline tracking-normal text-gray-600">{task.project.code}</span>
        <span>
          {permissions.canEditDev ? <DevStatusMenu fr={task} trigger={<MenuTrigger aria-label="Dev status"><DevStatusPill status={task.dev} /></MenuTrigger>} /> : <DevStatusPill status={task.dev} />}
        </span>
        <span>
          {permissions.canEditQa ? <QaStatusMenu fr={task} trigger={<MenuTrigger aria-label="QA status"><QaStatusPill status={task.qa} /></MenuTrigger>} /> : <QaStatusPill status={task.qa} />}
        </span>
        <span className="flex flex-col gap-[3px] pr-1">
          <span className="font-mono text-overline tracking-normal whitespace-nowrap text-gray-700">{progress.label}</span>
          <ProgressBar value={progress.value} tone={progress.tone} className="h-1" />
        </span>
        <span className={cn("font-mono text-caption whitespace-nowrap", late ? "font-semibold text-danger-fg" : "text-gray-600")}>
          {late && "Overdue · "}
          {task.targetDate ? formatIsoDate(task.targetDate) : "—"}
        </span>
        <span>
          {quick && !(quick.kind === "expand" && open) && (
            <Button size="sm" variant="outline" className="border-info-border bg-info-bg text-info-fg hover:bg-cobalt-100" onClick={() => onQuick(task, quick)}>
              {quick.label}
            </Button>
          )}
        </span>
      </div>
      {open && <TaskAcs task={task} />}
    </>
  )
}

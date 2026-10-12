"use client"

import { cn } from "cn"
import { ChevronRightIcon } from "lucide-react"
import type * as React from "react"

import type { FrRow } from "../types/requirement"
import { DEV_STATUSES, type DevStatus } from "../types/status"
import { columnHint, dropKind, type BoardLane, type ColumnHint, type DropKind } from "../utils/board"
import type { FrPermissions } from "../utils/permissions"
import { useFr } from "./fr-context"
import { DevStatusPill } from "./status-pills"

export const BOARD_GRID = "grid grid-cols-[repeat(4,minmax(220px,1fr))] gap-3"

const HINT_TONE: Record<ColumnHint["tone"], string> = {
  info: "text-cobalt-700",
  success: "text-success-fg",
  warning: "text-warning-fg",
  danger: "text-danger-fg",
  muted: "text-gray-600",
}

/** Sticky column headers: dev status, card count, and the drop hint while dragging. */
export function BoardColumnHeads({ counts, dragged, over }: { counts: Record<DevStatus, number>; dragged: FrRow | null; over: DevStatus | null }) {
  const { permissions } = useFr()
  return (
    <div className={cn(BOARD_GRID, "sticky top-0 z-[6] bg-white pt-1 pb-2")}>
      {DEV_STATUSES.map((status) => {
        const hint = dragged && columnHint(dragged, status, permissions, over === status)
        return (
          <div key={status} className="flex flex-col gap-1">
            <div className="flex h-7 items-center gap-2">
              <DevStatusPill status={status} />
              <span className="font-mono text-caption text-gray-700">{counts[status]}</span>
            </div>
            {hint && <span className={cn("text-overline leading-[14px] font-medium tracking-normal", HINT_TONE[hint.tone])}>{hint.text}</span>}
          </div>
        )
      })}
    </div>
  )
}

// Per drop outcome: a dashed tint while dragging, solid and stronger under the pointer.
const DROP_TONE: Record<Exclude<DropKind, "same">, string> = {
  move: "border-dashed border-cobalt-200 bg-cobalt-50/50 data-over:border-solid data-over:border-cobalt-500 data-over:bg-cobalt-50",
  done: "border-dashed border-success-border bg-success-bg/50 data-over:border-solid data-over:border-success-solid data-over:bg-success-bg",
  override: "border-dashed border-warning-border bg-warning-subtle data-over:border-solid data-over:border-warning-solid data-over:bg-warning-bg",
  blocked: "border-dashed border-danger-border bg-danger-subtle data-over:border-solid data-over:border-danger-solid data-over:bg-danger-bg",
}

type DropCellProps = {
  status: DevStatus
  dragged: FrRow | null
  over: boolean
  permissions: FrPermissions
  onEnter: (status: DevStatus) => void
  onDrop: (status: DevStatus) => void
  children: React.ReactNode
}

/** One lane × status cell: a drop target tinted by what dropping the dragged card would do. */
export function DropCell({ status, dragged, over, permissions, onEnter, onDrop, children }: DropCellProps) {
  const kind = dragged ? dropKind(dragged, status, permissions) : "same"
  return (
    <div
      data-over={(over && kind !== "same") || undefined}
      onDragOver={(e) => {
        if (!dragged) return
        e.preventDefault()
        if (!over) onEnter(status)
      }}
      onDrop={(e) => {
        e.preventDefault()
        onDrop(status)
      }}
      className={cn("flex min-h-[76px] flex-col gap-2 rounded-[10px] border-[1.5px] border-transparent bg-gray-25 p-2 transition-colors", kind !== "same" && DROP_TONE[kind])}
    >
      {children}
    </div>
  )
}

/** Collapsible swimlane header with Dev/QA rollups, like the table's group rows. */
export function LaneHeader({ lane, onToggle }: { lane: BoardLane; onToggle: () => void }) {
  const { stats } = lane
  return (
    <button
      type="button"
      aria-expanded={!lane.collapsed}
      onClick={onToggle}
      className="flex h-[34px] w-full items-center gap-2 rounded-md bg-gray-50 px-2.5 text-left outline-none focus-visible:shadow-[inset_0_0_0_2px_var(--color-primary)]"
    >
      <ChevronRightIcon className={cn("size-3 text-gray-700 transition-transform", !lane.collapsed && "rotate-90")} />
      <span className="truncate text-ui font-semibold">{lane.label}</span>
      <span className="font-mono text-overline tracking-normal whitespace-nowrap text-gray-600">{stats.count} {stats.count === 1 ? "FR" : "FRs"}</span>
      <span className="flex-1" />
      <span className="hidden gap-2.5 text-overline tracking-normal text-gray-700 sm:flex">
        <span>Dev <span className="font-mono">{stats.devPct}%</span></span>
        <span>QA <span className="font-mono">{stats.qaPct}%</span></span>
        <span className="font-mono">{stats.done}/{stats.count} done</span>
      </span>
    </button>
  )
}

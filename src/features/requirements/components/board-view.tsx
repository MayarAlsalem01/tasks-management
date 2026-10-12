"use client"

import { CircleAlertIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { NewItem, ROUTES, SearchParam, withQuery } from "@/lib/routes"

import { useBoardDrag, type RejectedDrop } from "../hooks/use-board-drag"
import { DEV_STATUS_LABEL, DEV_STATUSES, type DevStatus } from "../types/status"
import { DrawerTab } from "../types/table"
import { buildBoardLanes } from "../utils/board"
import { todayIso } from "../utils/dates"
import { describeFilters, hasActiveFilters } from "../utils/table-params"
import { filterRows } from "../utils/table-rows"
import { BoardCard } from "./board-card"
import { BOARD_GRID, BoardColumnHeads, DropCell, LaneHeader } from "./board-columns"
import { BoardToolbar } from "./board-toolbar"
import { NoActivities, NoRequirements, NoResults } from "./requirements-empty"
import { RequirementsWorkspace, type RequirementsViewProps, type Workspace } from "./requirements-workspace"

function RejectAlert({ rejected, onOpen, onDismiss }: { rejected: RejectedDrop; onOpen: () => void; onDismiss: () => void }) {
  return (
    <Alert variant="destructive" className="mb-2.5 border-danger-border bg-danger-bg text-danger-strong">
      <CircleAlertIcon />
      <div className="flex flex-col gap-2">
        <p><b className="font-semibold">{rejected.code} can&apos;t move to Done.</b> {rejected.pending} of {rejected.total} acceptance criteria are not yet dev-done. The card went back to {DEV_STATUS_LABEL[rejected.from]}.</p>
        <span className="flex gap-1.5">
          <Button size="sm" variant="destructive" onClick={onOpen}>Open acceptance criteria</Button>
          <Button size="sm" variant="ghost" className="text-danger-strong hover:bg-danger-tint" onClick={onDismiss}>Dismiss</Button>
        </span>
      </div>
    </Alert>
  )
}

/** The board body: column heads, swimlanes of drop cells, and the cards in them. */
function Board({ rows, params, permissions, requestDevStatus, openFr }: Workspace) {
  const [collapsed, setCollapsed] = useState<ReadonlySet<string>>(new Set())
  const drag = useBoardDrag(rows, permissions, requestDevStatus)
  const today = todayIso()
  const lanes = buildBoardLanes(rows, params.lanes, collapsed)
  const counts = Object.fromEntries(DEV_STATUSES.map((s) => [s, rows.filter((fr) => fr.dev === s).length])) as Record<DevStatus, number>
  const { rejected } = drag
  const toggle = (key: string) =>
    setCollapsed((keys) => {
      const next = new Set(keys)
      if (!next.delete(key)) next.add(key)
      return next
    })

  return (
    <div className="min-w-max px-4 pb-6 lg:px-6">
      {rejected && (
        <RejectAlert
          rejected={rejected}
          onOpen={() => {
            openFr(rejected.code, DrawerTab.Acs)
            drag.dismiss()
          }}
          onDismiss={drag.dismiss}
        />
      )}
      <BoardColumnHeads counts={counts} dragged={drag.dragged} over={drag.over} />
      <div className="flex flex-col gap-2.5">
        {lanes.map((lane) => (
          <section key={lane.key} aria-label={lane.label} className="flex flex-col gap-2">
            {lane.label && <LaneHeader lane={lane} onToggle={() => toggle(lane.key)} />}
            {!lane.collapsed && (
              <div className={BOARD_GRID}>
                {DEV_STATUSES.map((status) => (
                  <DropCell key={status} status={status} dragged={drag.dragged} over={drag.over === status} permissions={permissions} onEnter={drag.enter} onDrop={drag.drop}>
                    {lane.cells[status].map((fr) => (
                      <BoardCard key={fr.id} fr={fr} today={today} selected={fr.code === params.fr} lifted={drag.dragged?.id === fr.id} shaking={drag.shakeId === fr.id} onDragStart={drag.start} onDragEnd={drag.end} />
                    ))}
                    {!lane.cells[status].length && <p className="py-3.5 text-center text-caption text-gray-500">No FRs</p>}
                  </DropCell>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  )
}

/**
 * The project Kanban board (Stage 4): FR cards in dev-status columns, optionally split into
 * activity swimlanes. Dragging a card changes its dev status through the shared status flow,
 * so Dev-Done gating and the Admin/PO override (FR-WKF-001) match the table and drawer.
 * Archived FRs never show here.
 */
export function BoardView(props: RequirementsViewProps) {
  const router = useRouter()
  const { project, people } = props
  const createIn = (item: NewItem) => router.push(withQuery(ROUTES.project(project.code), { [SearchParam.New]: item }))

  const render = (workspace: Workspace) => {
    const { rows, params, update, clearFilters, permissions } = workspace
    const live = rows.filter((fr) => !fr.archived)
    // The columns are dev status, so a Dev filter carried over from the table is ignored.
    const visible = filterRows(live, { ...params, dev: undefined, archived: false })

    const body = (() => {
      if (!project.activities.length) return <NoActivities canManage={permissions.canManage} onCreate={() => createIn(NewItem.Activity)} />
      if (!live.length) return <NoRequirements canManage={permissions.canManage} onCreate={() => createIn(NewItem.Fr)} />
      if (!visible.length) return <NoResults summary={describeFilters(params, (id) => people.find((p) => p.id === id)?.fullName) || "Nothing in this step yet."} onClear={hasActiveFilters(params) ? clearFilters : undefined} />
      return <Board {...workspace} rows={visible} />
    })()

    return (
      <>
        <BoardToolbar params={params} people={people} permissions={permissions} update={update} onClear={clearFilters} />
        <div className="min-h-0 flex-1 overflow-auto">{body}</div>
      </>
    )
  }

  return <RequirementsWorkspace {...props}>{render}</RequirementsWorkspace>
}

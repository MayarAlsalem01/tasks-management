import type { FrRow } from "../types/requirement"
import { DEV_STATUSES, DevStatus } from "../types/status"
import { BoardLanes } from "../types/table"
import { devDoneGate, type FrPermissions } from "./permissions"
import { groupBy, groupStats, type GroupStats } from "./table-rows"

export type BoardLane = {
  key: string
  /** `undefined` for the single lane without swimlanes (no header). */
  label?: string
  stats: GroupStats
  collapsed: boolean
  cells: Record<DevStatus, FrRow[]>
}

function cellsOf(rows: readonly FrRow[]) {
  const cells = Object.fromEntries(DEV_STATUSES.map((status) => [status, [] as FrRow[]])) as Record<DevStatus, FrRow[]>
  for (const fr of rows) cells[fr.dev].push(fr)
  return cells
}

/** Splits board cards into swimlanes (one per activity, in FR order) and dev-status cells. */
export function buildBoardLanes(rows: readonly FrRow[], mode: BoardLanes, collapsed: ReadonlySet<string>): BoardLane[] {
  if (mode === BoardLanes.None) return [{ key: "all", stats: groupStats(rows), collapsed: false, cells: cellsOf(rows) }]
  return [...groupBy(rows, (fr) => fr.activityId)].map(([activityId, list]) => {
    const key = `a:${activityId}`
    return { key, label: list[0].activityName, stats: groupStats(list), collapsed: collapsed.has(key), cells: cellsOf(list) }
  })
}

/** What dropping a card on a dev-status column would do (FR-WKF-001 via `devDoneGate`). */
export type DropKind = "same" | "move" | "done" | "override" | "blocked"

export function dropKind(fr: FrRow, status: DevStatus, permissions: FrPermissions): DropKind {
  if (fr.dev === status) return "same"
  if (status !== DevStatus.Done) return "move"
  const gate = devDoneGate(fr.acs, permissions)
  return gate.kind === "allowed" ? "done" : gate.kind
}

export type ColumnHint = { text: string; tone: "info" | "success" | "warning" | "danger" | "muted" }

/** The hint under a column header while a card is being dragged. */
export function columnHint(fr: FrRow, status: DevStatus, permissions: FrPermissions, hovered: boolean): ColumnHint | null {
  const kind = dropKind(fr, status, permissions)
  if (status === DevStatus.Done) {
    const pending = fr.acs.filter((ac) => !ac.devDone).length
    const count = `${pending} of ${fr.acs.length} ACs not dev-done`
    if (kind === "done") return { text: "Eligible · all ACs dev-done", tone: "success" }
    if (kind === "blocked") return { text: `Not eligible · ${count}`, tone: "danger" }
    if (kind === "override") return { text: `Override needed · ${count}`, tone: "warning" }
    return { text: "Current column", tone: "muted" }
  }
  return hovered && kind === "move" ? { text: "Drop to move here", tone: "info" } : null
}

import { percent } from "@/lib/progress"

import type { FrRow } from "../types/requirement"
import { DEV_STATUS_LABEL, DEV_STATUSES, DevStatus } from "../types/status"
import { FrGroupBy, UNASSIGNED } from "../types/table"
import type { TableParams } from "./table-params"

/** FRs that match the URL filters, the selected sidebar step and the archived toggle. */
export function filterRows(rows: readonly FrRow[], params: TableParams) {
  const query = params.q?.toLowerCase()
  return rows.filter(
    (fr) =>
      (params.archived || !fr.archived) &&
      (!params.step || fr.stepId === params.step) &&
      (!params.priority || fr.priority === params.priority) &&
      (!params.dev || fr.dev === params.dev) &&
      (!params.qa || fr.qa === params.qa) &&
      (!params.spec || fr.spec === params.spec) &&
      matchesAssignee(fr, params.assignee) &&
      (!query || fr.code.toLowerCase().includes(query) || fr.title.toLowerCase().includes(query)),
  )
}

function matchesAssignee(fr: FrRow, assignee: string | undefined) {
  if (!assignee) return true
  if (assignee === UNASSIGNED) return fr.developers.length === 0
  return fr.developers.some((d) => d.id === assignee)
}

export type GroupStats = { count: number; devPct: number; qaPct: number; done: number }

/** Group header numbers: AC-weighted Dev/QA progress and how many FRs are Done. */
export function groupStats(rows: readonly FrRow[]): GroupStats {
  const acs = rows.flatMap((fr) => fr.acs)
  return {
    count: rows.length,
    devPct: percent(acs.filter((ac) => ac.devDone).length, acs.length),
    qaPct: percent(acs.filter((ac) => ac.qaPassed).length, acs.length),
    done: rows.filter((fr) => fr.dev === DevStatus.Done).length,
  }
}

export type TableItem =
  | { kind: "group"; key: string; label: string; level: 0 | 1; stats: GroupStats; collapsed: boolean }
  | { kind: "fr"; row: FrRow }

/** Groups keep first-appearance order, so they follow the FR order (activity, step, sort). */
function groupBy(rows: readonly FrRow[], keyOf: (fr: FrRow) => string) {
  const groups = new Map<string, FrRow[]>()
  for (const fr of rows) groups.set(keyOf(fr), [...(groups.get(keyOf(fr)) ?? []), fr])
  return groups
}

/**
 * Flattens filtered rows into the table's render list: group headers (with stats) followed
 * by their FRs, skipping the FRs of collapsed groups. Activity grouping nests steps.
 */
export function buildTableItems(rows: readonly FrRow[], mode: FrGroupBy, collapsed: ReadonlySet<string>): TableItem[] {
  const items: TableItem[] = []
  const pushGroup = (key: string, label: string, list: FrRow[], level: 0 | 1, inner?: () => void) => {
    const isCollapsed = collapsed.has(key)
    items.push({ kind: "group", key, label, level, stats: groupStats(list), collapsed: isCollapsed })
    if (!isCollapsed) (inner ?? (() => list.forEach((row) => items.push({ kind: "fr", row }))))()
  }

  if (mode === FrGroupBy.Activity) {
    for (const [activityId, list] of groupBy(rows, (fr) => fr.activityId)) {
      pushGroup(`a:${activityId}`, list[0].activityName, list, 0, () => {
        for (const [stepId, steps] of groupBy(list, (fr) => fr.stepId)) pushGroup(`s:${stepId}`, steps[0].stepName, steps, 1)
      })
    }
  } else if (mode === FrGroupBy.Assignee) {
    for (const [id, list] of groupBy(rows, (fr) => fr.developers[0]?.id ?? UNASSIGNED)) {
      pushGroup(`u:${id}`, list[0].developers[0]?.fullName ?? "Unassigned", list, 0)
    }
  } else if (mode === FrGroupBy.Dev) {
    const groups = groupBy(rows, (fr) => fr.dev)
    for (const status of DEV_STATUSES) {
      const list = groups.get(status)
      if (list) pushGroup(`d:${status}`, DEV_STATUS_LABEL[status], list, 0)
    }
  } else {
    rows.forEach((row) => items.push({ kind: "fr", row }))
  }
  return items
}

import { percent } from "@/lib/progress"

import type { ActivityProgress, StatusDistribution } from "../types/dashboard"
import type { FrRow } from "../types/requirement"
import { DEV_STATUSES, QA_STATUSES } from "../types/status"

/** Gap (Dev done minus QA passed, in points) from which built work counts as waiting on QA. */
export const QA_GAP_WARNING = 40

/**
 * Share of acceptance criteria dev-done and QA-passed per backbone activity (FR-UI-003
 * rollup), over active FRs. Activities without FRs are listed too, in tree order.
 */
export function activityProgress(rows: FrRow[], activities: { id: string; name: string }[]): ActivityProgress[] {
  const active = rows.filter((r) => !r.archived)
  return activities.map(({ id, name }) => {
    const frs = active.filter((r) => r.activityId === id)
    const acs = frs.flatMap((r) => r.acs)
    return {
      id,
      name,
      frs: frs.length,
      acs: acs.length,
      dev: percent(acs.filter((ac) => ac.devDone).length, acs.length),
      qa: percent(acs.filter((ac) => ac.qaPassed).length, acs.length),
    }
  })
}

/** How many active FRs are in each Dev and QA status, in display order. */
export function statusDistribution(rows: FrRow[]): StatusDistribution {
  const active = rows.filter((r) => !r.archived)
  return {
    total: active.length,
    dev: DEV_STATUSES.map((status) => ({ status, count: active.filter((r) => r.dev === status).length })),
    qa: QA_STATUSES.map((status) => ({ status, count: active.filter((r) => r.qa === status).length })),
  }
}

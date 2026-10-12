import { z } from "zod"

import { SearchParam } from "@/lib/routes"

import { TrendWindow } from "../types/dashboard"
import type { DashboardHistory } from "../types/dashboard"
import type { FrRow } from "../types/requirement"
import { attentionLists } from "./dashboard-attention"
import { activityProgress, statusDistribution } from "./dashboard-rollup"
import { buildMetrics } from "./dashboard-trends"
import { todayIso } from "./dates"

type Params = Record<string, string | string[] | undefined>

const single = z.preprocess((v) => (Array.isArray(v) ? v[0] : v), z.string().trim().optional())

const dashboardParamsSchema = z.object({
  [SearchParam.Step]: single.transform((v) => v || undefined).catch(undefined),
  [SearchParam.Trend]: single.pipe(z.enum(TrendWindow).optional()).catch(undefined).transform((v) => v ?? TrendWindow.Week),
})

export type DashboardParams = z.output<typeof dashboardParamsSchema>

/** Dashboard state from the URL (selected step, trend window). Bad values fall back to defaults. */
export function parseDashboardParams(params: Params | URLSearchParams): DashboardParams {
  const record = params instanceof URLSearchParams ? Object.fromEntries(params) : params
  return dashboardParamsSchema.parse(record)
}

type ActivityNode = { id: string; name: string; steps: { id: string }[] }

/**
 * Everything the project dashboard renders (FR-UI-003), computed from the FR rows, the
 * project tree and the audit history. When a step is selected, only its FRs and activity
 * count, matching the header's step scope.
 */
export function buildDashboard(rows: FrRow[], activities: ActivityNode[], history: DashboardHistory, params: DashboardParams, now: Date) {
  const selected = params[SearchParam.Step]
  // An unknown step (deleted, or from another project) falls back to the whole project, like the header.
  const step = activities.some((a) => a.steps.some((s) => s.id === selected)) ? selected : undefined
  const scoped = step ? rows.filter((r) => r.stepId === step) : rows
  const scopedActivities = step ? activities.filter((a) => a.steps.some((s) => s.id === step)) : activities
  return {
    metrics: buildMetrics(scoped, history, Number(params[SearchParam.Trend]), now),
    activities: activityProgress(scoped, scopedActivities),
    distribution: statusDistribution(scoped),
    lists: attentionLists(scoped, history, now, todayIso(now)),
  }
}

export type DashboardData = ReturnType<typeof buildDashboard>

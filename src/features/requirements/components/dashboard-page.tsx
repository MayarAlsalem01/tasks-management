import "server-only"

import { notFound } from "next/navigation"
import { Suspense } from "react"

import { Skeleton } from "@/components/ui/skeleton"
import { getProjectNavForUser } from "@/features/projects/server"
import { requireUser } from "@/lib/auth/session"
import { SearchParam } from "@/lib/routes"

import { getDashboardHistory, getProjectRequirements } from "../cache/queries"
import { buildDashboard, parseDashboardParams } from "../utils/dashboard"
import { DashboardActivityProgress } from "./dashboard-activity-progress"
import { DashboardAttention } from "./dashboard-attention"
import { DashboardDistribution } from "./dashboard-distribution"
import { DashboardMetrics } from "./dashboard-metrics"
import { DashboardSkeleton } from "./dashboard-skeleton"
import { DashboardTrendToggle } from "./dashboard-trend-toggle"

type DashboardPageProps = {
  params: Promise<{ code: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

/**
 * Loads the project's FRs and status history and renders the dashboard sections. 404s for
 * missing projects and non-members alike. Reads the session, so it must sit inside `<Suspense>`.
 */
async function DashboardLoader({ params, searchParams }: DashboardPageProps) {
  const [{ code }, query, user] = await Promise.all([params, searchParams, requireUser()])
  const project = await getProjectNavForUser(code, user.id, user.isAdmin)
  if (!project) notFound()
  const [rows, history] = await Promise.all([getProjectRequirements(project.id), getDashboardHistory(project.id)])
  const dashboardParams = parseDashboardParams(query)
  const { metrics, activities, distribution, lists } = buildDashboard(rows, project.activities, history, dashboardParams, new Date())
  return (
    <>
      <DashboardMetrics metrics={metrics} days={Number(dashboardParams[SearchParam.Trend])} />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <DashboardActivityProgress activities={activities} />
        <DashboardDistribution distribution={distribution} />
      </div>
      <DashboardAttention lists={lists} projectCode={project.code} />
    </>
  )
}

/**
 * Project › Dashboard view (FR-UI-003): headline metrics with trends, the per-activity
 * rollup, status distribution and the "needs attention" lists. The title row is static;
 * the data streams behind a matching skeleton. The project layout renders the header.
 */
export function ProjectDashboardPage(props: DashboardPageProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-gray-25">
      <div className="flex flex-col gap-4 px-4 pt-5 pb-8 lg:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-title-2">Progress overview</h2>
          <span className="flex-1" />
          <Suspense fallback={<Skeleton className="h-[30px] w-44 bg-gray-75" />}>
            <DashboardTrendToggle />
          </Suspense>
        </div>
        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardLoader {...props} />
        </Suspense>
      </div>
    </div>
  )
}

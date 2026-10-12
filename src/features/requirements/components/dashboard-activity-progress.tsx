import { cn } from "cn"

import type { ActivityProgress } from "../types/dashboard"
import { QA_GAP_WARNING } from "../utils/dashboard-rollup"

function Bar({ value, className }: { value: number; className: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="h-2.5 flex-1 overflow-hidden rounded-[5px] bg-gray-100">
        <span className={cn("block h-2.5", className)} style={{ width: `${value}%` }} />
      </span>
      <span className="w-[38px] text-right font-mono text-caption">{value}%</span>
    </div>
  )
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-caption text-gray-700">
      <span className={cn("size-2.5 rounded-[2px]", className)} />
      {label}
    </span>
  )
}

/**
 * "Built vs verified by activity" (FR-UI-003 rollup): per activity, the share of ACs
 * dev-done and QA-passed, and the gap between them. A large gap is flagged amber because
 * built work is waiting on verification.
 */
export function DashboardActivityProgress({ activities }: { activities: ActivityProgress[] }) {
  return (
    <section className="flex flex-col gap-3.5 rounded-[10px] border border-gray-150 bg-white px-5 py-[18px]">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="text-[15px] font-semibold">Built vs verified by activity</h2>
        <span className="text-caption text-gray-600">Share of acceptance criteria</span>
        <span className="flex-1" />
        <Legend className="bg-cobalt-500" label="Dev done" />
        <Legend className="bg-success-solid" label="QA passed" />
      </div>
      {activities.length === 0 && <p className="border-t border-gray-75 pt-3 text-ui text-gray-600">No activities yet.</p>}
      {activities.map((a) => {
        const gap = a.dev - a.qa
        return (
          <div key={a.id} className="grid grid-cols-[minmax(0,1fr)_96px] items-center gap-x-4 gap-y-2 border-t border-gray-75 pt-3 sm:grid-cols-[170px_minmax(0,1fr)_112px]">
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="truncate text-ui font-semibold">{a.name}</span>
              <span className="font-mono text-[11px] text-gray-600">{a.frs} FRs · {a.acs} ACs</span>
            </div>
            <div className="col-span-2 row-start-2 flex flex-col gap-1.5 sm:col-span-1 sm:row-start-auto">
              <Bar value={a.dev} className="bg-cobalt-500" />
              <Bar value={a.qa} className="bg-success-solid" />
            </div>
            <span
              className={cn(
                "col-start-2 row-start-1 inline-flex h-6 items-center justify-center rounded-md border text-caption font-semibold sm:col-start-auto sm:row-start-auto",
                gap >= QA_GAP_WARNING ? "border-warning-border bg-warning-bg text-warning-fg" : "border-gray-150 bg-gray-50 text-gray-700",
              )}
            >
              Gap {gap} pts
            </span>
          </div>
        )
      })}
      <p className="text-caption text-gray-600">Gap is Dev done minus QA passed. A large gap means built work is waiting on verification.</p>
    </section>
  )
}

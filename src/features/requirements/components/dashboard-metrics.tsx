import { cn } from "cn"

import type { DashboardMetric, MetricTone } from "../types/dashboard"
import { sparkline } from "../utils/dashboard-trends"

const STROKE: Record<MetricTone, string> = {
  neutral: "var(--color-gray-600)",
  dev: "var(--color-cobalt-500)",
  qa: "var(--color-success-solid)",
}

const SPARK = { width: 104, height: 32 }

function Sparkline({ series, tone }: { series: number[]; tone: MetricTone }) {
  const { line, area, end } = sparkline(series, SPARK.width, SPARK.height)
  return (
    <svg width={SPARK.width} height={SPARK.height} viewBox={`0 0 ${SPARK.width} ${SPARK.height}`} aria-hidden className="flex-none">
      <path d={area} fill={STROKE[tone]} fillOpacity={0.1} />
      <path d={line} fill="none" stroke={STROKE[tone]} strokeWidth={1.8} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={end.x} cy={end.y} r={2.6} fill={STROKE[tone]} />
    </svg>
  )
}

function DeltaChip({ delta, label }: { delta: number; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center gap-1 rounded-xs px-1.5 font-semibold",
        delta > 0 ? "bg-success-bg text-success-fg" : delta < 0 ? "bg-danger-bg text-danger-fg" : "bg-gray-75 text-gray-700",
      )}
    >
      {delta !== 0 && (
        <svg width="9" height="9" viewBox="0 0 10 10" aria-hidden className={cn(delta < 0 && "rotate-180")}>
          <path d="M5 1.5l4 6H1z" fill="currentColor" />
        </svg>
      )}
      {label}
    </span>
  )
}

/** Requirement count, dev completion and QA pass rate, each with a sparkline over the trend window. */
export function DashboardMetrics({ metrics, days }: { metrics: DashboardMetric[]; days: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {metrics.map((m) => (
        <div key={m.label} className="flex flex-col gap-2.5 rounded-[10px] border border-gray-150 bg-white px-[18px] py-4">
          <span className="text-ui font-medium text-gray-600">{m.label}</span>
          <div className="flex items-end gap-3">
            <span className="text-[40px] leading-10 font-semibold tracking-[-0.03em]">{m.value}</span>
            <span className="flex-1 pb-1 text-caption text-gray-600">{m.sub}</span>
            <Sparkline series={m.series} tone={m.tone} />
          </div>
          <div className="flex items-center gap-1.5 text-caption text-gray-700">
            <DeltaChip delta={m.delta} label={m.deltaLabel} />
            vs {days} days ago
          </div>
        </div>
      ))}
    </div>
  )
}

import { cn } from "cn"

import type { StatusCount, StatusDistribution } from "../types/dashboard"
import { DEV_STATUS_LABEL, QA_STATUS_LABEL, type DevStatus, type QaStatus } from "../types/status"
import { DevGlyph, QaGlyph } from "./status-glyphs"

// Same tones as the Dev pills (filled tint) and QA pills (outline on white).
const DEV_TONE: Record<DevStatus, { segment: string; text: string }> = {
  "not-started": { segment: "bg-gray-100", text: "text-gray-700" },
  "in-progress": { segment: "bg-cobalt-100", text: "text-cobalt-700" },
  blocked: { segment: "bg-danger-tint", text: "text-danger-strong" },
  done: { segment: "bg-success-tint", text: "text-success-fg" },
}

const QA_TONE: Record<QaStatus, { segment: string; text: string }> = {
  "not-tested": { segment: "border-[1.5px] border-gray-300 bg-white", text: "text-gray-650" },
  passed: { segment: "border-[1.5px] border-success-mark bg-white", text: "text-success-fg" },
  failed: { segment: "border-[1.5px] border-danger-mark bg-white", text: "text-danger-fg" },
}

type Tone = { segment: string; text: string }

function StatusBar<S extends string>({
  title,
  total,
  counts,
  tone,
  label,
  glyph,
}: {
  title: string
  total: number
  counts: StatusCount<S>[]
  tone: Record<S, Tone>
  label: Record<S, string>
  glyph: (status: S) => React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between text-caption">
        <span className="font-semibold">{title}</span>
        <span className="font-mono text-gray-600">{total} FRs</span>
      </div>
      <div className="flex h-[22px] gap-0.5">
        {total === 0 && <span className="flex-1 rounded-[3px] bg-gray-75" />}
        {counts.filter((c) => c.count > 0).map(({ status, count }) => (
          <span
            key={status}
            title={`${label[status]}: ${count}`}
            className={cn("inline-flex min-w-[22px] items-center justify-center rounded-[3px] text-[11px] font-semibold", tone[status].segment, tone[status].text)}
            style={{ flex: count }}
          >
            {count}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
        {counts.map(({ status, count }) => (
          <span key={status} className="flex items-center gap-1.5 text-caption text-gray-700">
            <span className={cn("inline-flex", tone[status].text)}>{glyph(status)}</span>
            {label[status]}
            <span className="ml-auto font-mono text-gray-600">{count}</span>
          </span>
        ))}
      </div>
    </div>
  )
}

/** How many FRs sit in each Dev and QA status, as proportional bars with a legend. */
export function DashboardDistribution({ distribution }: { distribution: StatusDistribution }) {
  return (
    <section className="flex flex-col gap-4 rounded-[10px] border border-gray-150 bg-white px-5 py-[18px]">
      <h2 className="text-[15px] font-semibold">Status distribution</h2>
      <StatusBar title="Dev status" total={distribution.total} counts={distribution.dev} tone={DEV_TONE} label={DEV_STATUS_LABEL} glyph={(s) => <DevGlyph status={s} />} />
      <StatusBar title="QA status" total={distribution.total} counts={distribution.qa} tone={QA_TONE} label={QA_STATUS_LABEL} glyph={(s) => <QaGlyph status={s} />} />
    </section>
  )
}

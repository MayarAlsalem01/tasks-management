import { cn } from "cn"

import { percent } from "@/lib/progress"

import type { AcRow } from "../types/requirement"
import { AcSummary } from "./status-pills"

/** Thin progress bar; `tone` is a background class for the filled part. */
export function ProgressBar({ value, tone, className }: { value: number; tone: string; className?: string }) {
  return (
    <span className={cn("block h-[3px] overflow-hidden rounded-full bg-gray-100", className)}>
      <span className={cn("block h-full rounded-full", tone)} style={{ width: `${value}%` }} />
    </span>
  )
}

/** "Dev 2/4 · QA 1/4" with stacked Dev and QA bars; the QA bar turns red when an AC failed. */
export function AcProgress({ acs }: { acs: readonly AcRow[] }) {
  const dev = acs.filter((ac) => ac.devDone).length
  const qa = acs.filter((ac) => ac.qaPassed).length
  const failed = acs.some((ac) => ac.qaFailed)
  return (
    <span className="flex flex-col gap-[3px] pr-1.5">
      <AcSummary dev={dev} qa={qa} total={acs.length} className="text-overline tracking-normal whitespace-nowrap" />
      <span className="flex flex-col gap-0.5">
        <ProgressBar value={percent(dev, acs.length)} tone="bg-primary" />
        <ProgressBar value={percent(qa, acs.length)} tone={failed ? "bg-danger-mark" : "bg-success-mark"} />
      </span>
    </span>
  )
}

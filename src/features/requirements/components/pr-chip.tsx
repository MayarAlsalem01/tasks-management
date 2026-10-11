import { cn } from "cn"

import type { PrState } from "../types/status"
import { PrGlyph } from "./status-glyphs"

const STATE: Record<PrState, { label: string; tone: string }> = {
  open: { label: "Open", tone: "text-success-fg" },
  merged: { label: "Merged", tone: "text-merged" },
  draft: { label: "Draft", tone: "text-muted-foreground" },
  closed: { label: "Closed", tone: "text-danger-fg" },
}

type PrChipProps = {
  repo: string
  number: number
  state: PrState
  /** Compact form for table cells and field values: number only. */
  compact?: boolean
  showState?: boolean
  className?: string
}

export function PrChip({ repo, number, state, compact = false, showState = false, className }: PrChipProps) {
  const { label, tone } = STATE[state]
  return (
    <span
      title={`${repo}#${number} · ${label}`}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border bg-white font-mono text-muted-foreground",
        compact ? "h-[22px] px-[7px] text-overline tracking-normal text-gray-700" : "h-6 px-2 text-caption",
        className
      )}
    >
      <PrGlyph state={state} size={compact ? 11 : 12} />
      {!compact && repo}
      <span className={cn(!compact && "font-medium text-foreground")}>#{number}</span>
      {showState && <span className={cn("font-sans text-overline tracking-normal", tone)}>{label}</span>}
    </span>
  )
}

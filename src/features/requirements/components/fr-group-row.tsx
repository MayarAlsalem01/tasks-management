import { cn } from "cn"
import { ChevronRightIcon } from "lucide-react"

import type { GroupStats } from "../utils/table-rows"
import { ProgressBar } from "./ac-progress"

function GroupMeter({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <span className="hidden items-center gap-1.5 text-overline tracking-normal text-gray-700 sm:flex">
      <span className="text-gray-600">{label}</span>
      <ProgressBar value={value} tone={tone} className="h-[5px] w-[70px]" />
      <span className="w-[30px] text-right font-mono">{value}%</span>
    </span>
  )
}

/** Collapsible group header (activity, step, assignee or dev status) with rollup progress. */
export function FrGroupRow({ label, level, stats, collapsed, onToggle }: { label: string; level: 0 | 1; stats: GroupStats; collapsed: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      aria-expanded={!collapsed}
      onClick={onToggle}
      className={cn(
        "flex w-full items-center gap-2 border-b border-gray-150 text-left outline-none focus-visible:shadow-[inset_0_0_0_2px_var(--color-primary)]",
        level === 0 ? "h-10 bg-gray-50 px-4" : "h-[34px] bg-gray-25 pr-4 pl-9",
      )}
    >
      <ChevronRightIcon className={cn("size-3 text-gray-700 transition-transform", !collapsed && "rotate-90")} />
      <span className={cn("truncate text-ui", level === 0 ? "font-semibold" : "font-medium")}>{label}</span>
      <span className="font-mono text-overline tracking-normal whitespace-nowrap text-gray-600">{stats.count} {stats.count === 1 ? "FR" : "FRs"}</span>
      <span className="flex-1" />
      <GroupMeter label="Dev" value={stats.devPct} tone="bg-primary" />
      <GroupMeter label="QA" value={stats.qaPct} tone="bg-success-solid" />
      <span className="w-[70px] text-right font-mono text-overline tracking-normal whitespace-nowrap text-gray-600">{stats.done}/{stats.count} done</span>
    </button>
  )
}

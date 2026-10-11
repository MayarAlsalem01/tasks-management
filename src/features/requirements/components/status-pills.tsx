import { cn } from "cn"

import { Badge } from "@/components/ui/badge"

import type { DevStatus, Priority, QaStatus, SpecStatus } from "../types/status"
import { DevGlyph, FlagGlyph, PriorityGlyph, QaGlyph, SpecGlyph } from "./status-glyphs"

const DEV: Record<DevStatus, { label: string; variant: "secondary" | "default" | "destructive" | "success"; knockout?: string }> = {
  "not-started": { label: "Not started", variant: "secondary" },
  "in-progress": { label: "In progress", variant: "default" },
  blocked: { label: "Blocked", variant: "destructive" },
  done: { label: "Done", variant: "success", knockout: "var(--color-success-tint)" },
}

/** Dev status: filled tint, square corners, circle glyph. */
export function DevStatusPill({ status, className }: { status: DevStatus; className?: string }) {
  const { label, variant, knockout } = DEV[status]
  return (
    <Badge
      variant={variant}
      className={className}
      style={knockout ? ({ "--glyph-knockout": knockout } as React.CSSProperties) : undefined}
    >
      <DevGlyph status={status} />
      {label}
    </Badge>
  )
}

const QA: Record<QaStatus, { label: string; tone: string }> = {
  "not-tested": { label: "Not tested", tone: "border-gray-300 text-gray-650" },
  passed: { label: "Passed", tone: "border-success-mark text-success-fg" },
  failed: { label: "Failed", tone: "border-danger-mark text-danger-fg" },
}

/** QA status: outline on white, fully round, shield glyph. */
export function QaStatusPill({ status, className }: { status: QaStatus; className?: string }) {
  const { label, tone } = QA[status]
  return (
    <Badge variant="outline" shape="round" className={cn("pr-[9px] pl-[7px]", tone, className)}>
      <QaGlyph status={status} />
      {label}
    </Badge>
  )
}

const SPEC_LABEL: Record<SpecStatus, string> = {
  draft: "Draft",
  "pending-review": "Pending review",
  approved: "Approved",
}

/** Spec status: diamond glyph. `tag` renders a neutral tag; `plain` is for table cells and read-only fields. */
export function SpecStatusLabel({
  status,
  appearance = "plain",
  className,
}: {
  status: SpecStatus
  appearance?: "tag" | "plain"
  className?: string
}) {
  if (appearance === "tag") {
    return (
      <Badge variant="neutral" className={className}>
        <SpecGlyph status={status} />
        {SPEC_LABEL[status]}
      </Badge>
    )
  }
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <SpecGlyph status={status} />
      {SPEC_LABEL[status]}
    </span>
  )
}

const PRIORITY: Record<Priority, { label: string; tone: string }> = {
  critical: { label: "Critical", tone: "text-danger-fg" },
  high: { label: "High", tone: "text-priority-high-fg" },
  medium: { label: "Medium", tone: "text-warning-fg" },
  low: { label: "Low", tone: "text-muted-foreground" },
}

/** Priority: text plus bars (or the critical block). */
export function PriorityLabel({ priority, className }: { priority: Priority; className?: string }) {
  const { label, tone } = PRIORITY[priority]
  return (
    <span className={cn("inline-flex items-center gap-2 font-medium", tone, className)}>
      <PriorityGlyph priority={priority} />
      {label}
    </span>
  )
}

/** Open-issues flag. With `count`, renders the compact table form. */
export function OpenIssuesFlag({ count }: { count?: number }) {
  if (count === undefined) {
    return (
      <Badge variant="warning">
        <FlagGlyph />
        Open issues
      </Badge>
    )
  }
  return (
    <Badge variant="warning" size="sm" title="Open issues" className="h-5 gap-1">
      <FlagGlyph size={11} />
      {count}
    </Badge>
  )
}

/** "Dev 3/4 · QA 1/4" acceptance-criteria progress. */
export function AcSummary({
  dev,
  qa,
  total,
  className,
}: {
  dev: number
  qa: number
  total: number
  className?: string
}) {
  return (
    <span className={cn("font-mono text-caption text-gray-700", className)}>
      Dev {dev}/{total} · QA {qa}/{total}
    </span>
  )
}

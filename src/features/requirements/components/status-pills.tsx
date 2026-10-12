import { cn } from "cn"

import { Badge } from "@/components/ui/badge"

import {
  DEV_STATUS_LABEL,
  PRIORITY_LABEL,
  QA_STATUS_LABEL,
  SPEC_STATUS_LABEL,
  type DevStatus,
  type Priority,
  type QaStatus,
  type SpecStatus,
} from "../types/status"
import { DevGlyph, FlagGlyph, PriorityGlyph, QaGlyph, SpecGlyph } from "./status-glyphs"

const DEV: Record<DevStatus, { variant: "secondary" | "default" | "destructive" | "success"; knockout?: string }> = {
  "not-started": { variant: "secondary" },
  "in-progress": { variant: "default" },
  blocked: { variant: "destructive" },
  done: { variant: "success", knockout: "var(--color-success-tint)" },
}

/** Dev status: filled tint, square corners, circle glyph. */
export function DevStatusPill({ status, className }: { status: DevStatus; className?: string }) {
  const { variant, knockout } = DEV[status]
  return (
    <Badge
      variant={variant}
      className={className}
      style={knockout ? ({ "--glyph-knockout": knockout } as React.CSSProperties) : undefined}
    >
      <DevGlyph status={status} />
      {DEV_STATUS_LABEL[status]}
    </Badge>
  )
}

const QA_TONE: Record<QaStatus, string> = {
  "not-tested": "border-gray-300 text-gray-650",
  passed: "border-success-mark text-success-fg",
  failed: "border-danger-mark text-danger-fg",
}

/** QA status: outline on white, fully round, shield glyph. */
export function QaStatusPill({ status, label, className }: { status: QaStatus; label?: string; className?: string }) {
  return (
    <Badge variant="outline" shape="round" className={cn("pr-[9px] pl-[7px]", QA_TONE[status], className)}>
      <QaGlyph status={status} />
      {label ?? QA_STATUS_LABEL[status]}
    </Badge>
  )
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
        {SPEC_STATUS_LABEL[status]}
      </Badge>
    )
  }
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <SpecGlyph status={status} />
      {SPEC_STATUS_LABEL[status]}
    </span>
  )
}

const PRIORITY_TONE: Record<Priority, string> = {
  critical: "text-danger-fg",
  high: "text-priority-high-fg",
  medium: "text-warning-fg",
  low: "text-muted-foreground",
}

/** Priority: text plus bars (or the critical block). */
export function PriorityLabel({ priority, className }: { priority: Priority; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-medium", PRIORITY_TONE[priority], className)}>
      <PriorityGlyph priority={priority} />
      {PRIORITY_LABEL[priority]}
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

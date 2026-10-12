"use client"

import { cn } from "cn"
import { ClockIcon, GripVerticalIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Role } from "@/lib/auth/roles"
import { percent } from "@/lib/progress"

import type { FrRow } from "../types/requirement"
import { DevStatus, SpecStatus } from "../types/status"
import { formatIsoDate, overdueDays } from "../utils/dates"
import { ProgressBar } from "./ac-progress"
import { AssigneeMenu } from "./assignee-menu"
import { useFr } from "./fr-context"
import { AssigneeSummary, MenuTrigger } from "./menu-trigger"
import { FlagGlyph, SpecGlyph } from "./status-glyphs"
import { AcSummary, PriorityLabel, QaStatusPill } from "./status-pills"

type BoardCardProps = {
  fr: FrRow
  today: string
  selected: boolean
  /** Being dragged: shown as a faded, dashed placeholder. */
  lifted: boolean
  /** A blocked Done drop just bounced this card back. */
  shaking: boolean
  onDragStart: (fr: FrRow) => void
  onDragEnd: () => void
}

/**
 * One FR on the board: priority, text, warnings, AC progress, developer, QA status and target
 * date. Draggable for people who can edit dev status; Admin/PO reassign from the avatar.
 * Click or Enter opens the drawer, which is also the keyboard path for changing status.
 */
export function BoardCard({ fr, today, selected, lifted, shaking, onDragStart, onDragEnd }: BoardCardProps) {
  const { permissions, openFr } = useFr()
  const draggable = permissions.canEditDev
  const late = overdueDays(fr.targetDate, fr.dev === DevStatus.Done, today)
  const dev = fr.acs.filter((ac) => ac.devDone).length
  const qa = fr.acs.filter((ac) => ac.qaPassed).length
  const pendingSpec = fr.spec === SpecStatus.PendingReview

  return (
    <div
      role="button"
      tabIndex={0}
      aria-current={selected || undefined}
      draggable={draggable}
      title={draggable ? undefined : "View only. Open to update QA status and ACs."}
      onClick={() => openFr(fr.code)}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && e.target === e.currentTarget && (e.preventDefault(), openFr(fr.code))}
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", fr.code)
        e.dataTransfer.effectAllowed = "move"
        onDragStart(fr)
      }}
      onDragEnd={onDragEnd}
      className={cn(
        "flex flex-col gap-2 rounded-lg border border-gray-150 bg-white px-3 py-2.5 shadow-e1 outline-none hover:border-cobalt-200 focus-visible:shadow-focus",
        draggable ? "cursor-grab active:cursor-grabbing" : "cursor-pointer",
        selected && "border-cobalt-500 hover:border-cobalt-500",
        lifted && "border-dashed border-gray-400 bg-gray-25 opacity-50",
        shaking && "animate-shake border-danger-solid shadow-[0_0_0_2px_var(--color-danger-border)]",
      )}
    >
      <div className="flex items-center gap-1.5">
        {draggable && <GripVerticalIcon aria-hidden className="-ml-1 size-3.5 flex-none text-gray-400" />}
        <span className="font-mono text-overline tracking-normal text-gray-700">{fr.code}</span>
        <span className="flex-1" />
        <PriorityLabel priority={fr.priority} className="text-caption" />
      </div>
      <p className="line-clamp-2 text-ui font-medium text-pretty">{fr.title}</p>
      {(fr.openIssues || pendingSpec) && (
        <div className="flex flex-wrap gap-1">
          {fr.openIssues && <Badge variant="warning" size="sm" title={fr.openIssues} className="h-5"><FlagGlyph size={11} />Open issues</Badge>}
          {pendingSpec && <Badge variant="warning" size="sm" className="h-5"><SpecGlyph status={fr.spec} size={9} />Pending review</Badge>}
        </div>
      )}
      <div className="flex flex-col gap-1">
        <AcSummary dev={dev} qa={qa} total={fr.acs.length} className="text-overline tracking-normal" />
        <span className="flex gap-0.5">
          <ProgressBar value={percent(dev, fr.acs.length)} tone="bg-primary" className="flex-1" />
          <ProgressBar value={percent(qa, fr.acs.length)} tone={fr.acs.some((ac) => ac.qaFailed) ? "bg-danger-mark" : "bg-success-solid"} className="flex-1" />
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        {permissions.canManage ? (
          <AssigneeMenu fr={fr} role={Role.Developer} trigger={<MenuTrigger aria-label="Developers" className="h-6"><AssigneeSummary people={fr.developers} /></MenuTrigger>} />
        ) : (
          <span className="inline-flex h-6 min-w-0 items-center"><AssigneeSummary people={fr.developers} /></span>
        )}
        <QaStatusPill status={fr.qa} className="h-5 gap-1 pr-[7px] pl-[5px] text-overline tracking-normal" />
        <span className="flex-1" />
        {fr.targetDate && (
          <span
            title={late ? `Overdue by ${late} day${late > 1 ? "s" : ""}` : undefined}
            className={cn("inline-flex items-center gap-1 font-mono text-overline tracking-normal whitespace-nowrap", late ? "font-semibold text-danger-fg" : "text-gray-600")}
          >
            {late > 0 && <ClockIcon className="size-3" />}
            {formatIsoDate(fr.targetDate)}
          </span>
        )}
      </div>
    </div>
  )
}

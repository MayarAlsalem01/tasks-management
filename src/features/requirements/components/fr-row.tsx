"use client"

import { cn } from "cn"
import { ClockIcon, MessageSquareTextIcon } from "lucide-react"

import { Role } from "@/lib/auth/roles"

import type { FrRow as FrRowData } from "../types/requirement"
import { DevStatus } from "../types/status"
import { FrColumn } from "../types/table"
import { formatIsoDate, overdueDays } from "../utils/dates"
import { AcProgress } from "./ac-progress"
import { AssigneeMenu } from "./assignee-menu"
import { useFr } from "./fr-context"
import { AssigneeSummary, MenuTrigger } from "./menu-trigger"
import { DevStatusMenu, QaStatusMenu } from "./status-menus"
import { DevStatusPill, OpenIssuesFlag, PriorityLabel, QaStatusPill, SpecStatusLabel } from "./status-pills"

type FrRowProps = {
  fr: FrRowData
  columns: readonly FrColumn[]
  grid: string
  selected: boolean
  today: string
}

/**
 * One FR in the project table. Cells the viewer may edit open inline menus (with a chevron);
 * everything else is plain text (Role Variants spec). Archived rows are read-only.
 */
export function FrRow({ fr, columns, grid, selected, today }: FrRowProps) {
  const { permissions, openFr } = useFr()
  const live = !fr.archived
  const late = overdueDays(fr.targetDate, fr.dev === DevStatus.Done, today)
  const show = (column: FrColumn) => columns.includes(column)

  return (
    <div
      role="button"
      tabIndex={0}
      aria-current={selected || undefined}
      onClick={() => openFr(fr.code)}
      onKeyDown={(e) => e.key === "Enter" && e.target === e.currentTarget && openFr(fr.code)}
      style={{ gridTemplateColumns: grid }}
      className={cn(
        "grid h-10 cursor-pointer items-center gap-2.5 border-b border-gray-75 px-4 text-ui outline-none hover:bg-gray-25 focus-visible:bg-gray-25",
        selected && "bg-cobalt-50 shadow-[inset_3px_0_0_var(--color-primary)] hover:bg-cobalt-50",
        fr.archived && "opacity-70",
      )}
    >
      <span className="font-mono text-caption text-gray-700">{fr.code}</span>
      <span className="flex min-w-0 items-center gap-2">
        <span title={fr.title} className={cn("truncate", fr.archived && "text-gray-600")}>{fr.title}</span>
        {fr.archived && <span className="flex-none rounded-xs border border-input px-1 text-overline text-gray-600">Archived</span>}
        {fr.openIssues && <span title={fr.openIssues} className="flex-none"><OpenIssuesFlag /></span>}
      </span>
      {show(FrColumn.Priority) && <PriorityLabel priority={fr.priority} className="text-caption" />}
      {show(FrColumn.Spec) && <SpecStatusLabel status={fr.spec} className="text-caption text-gray-700" />}
      {show(FrColumn.Assignee) && (
        <span className="min-w-0">
          {permissions.canManage && live ? (
            <AssigneeMenu fr={fr} role={Role.Developer} trigger={<MenuTrigger aria-label="Developers"><AssigneeSummary people={fr.developers} /></MenuTrigger>} />
          ) : (
            <AssigneeSummary people={fr.developers} />
          )}
        </span>
      )}
      {show(FrColumn.Dev) && (
        <span>
          {permissions.canEditDev && live ? <DevStatusMenu fr={fr} trigger={<MenuTrigger aria-label="Dev status"><DevStatusPill status={fr.dev} /></MenuTrigger>} /> : <DevStatusPill status={fr.dev} />}
        </span>
      )}
      {show(FrColumn.Qa) && (
        <span>
          {permissions.canEditQa && live ? <QaStatusMenu fr={fr} trigger={<MenuTrigger aria-label="QA status"><QaStatusPill status={fr.qa} /></MenuTrigger>} /> : <QaStatusPill status={fr.qa} />}
        </span>
      )}
      {show(FrColumn.Acs) && <AcProgress acs={fr.acs} />}
      {show(FrColumn.Target) && (
        <span
          title={late ? `Overdue by ${late} day${late > 1 ? "s" : ""}` : undefined}
          className={cn("inline-flex items-center gap-1 font-mono text-caption whitespace-nowrap", late ? "font-semibold text-danger-fg" : "text-gray-650")}
        >
          {late > 0 && <ClockIcon className="size-3" />}
          {fr.targetDate ? formatIsoDate(fr.targetDate) : "—"}
        </span>
      )}
      {show(FrColumn.Notes) && (
        <span title={fr.notes ?? undefined} className="inline-flex text-gray-600">
          {fr.notes && <MessageSquareTextIcon className="size-3.5" aria-label="Has notes" />}
        </span>
      )}
    </div>
  )
}

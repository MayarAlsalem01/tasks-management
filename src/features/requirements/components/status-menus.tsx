"use client"

import { cn } from "cn"
import { CheckIcon, TriangleAlertIcon } from "lucide-react"
import type * as React from "react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import type { FrRow } from "../types/requirement"
import { DEV_STATUSES, DevStatus, QA_STATUSES, QaStatus } from "../types/status"
import { devDoneGate, inProgressWarning, type FrPermissions } from "../utils/permissions"
import { useFrActions } from "./fr-context"
import { DevStatusPill, QaStatusPill } from "./status-pills"

// Menus are portaled, but React events still bubble to the table row: stop them so picking
// an option never opens the drawer.
const stop = (event: React.SyntheticEvent) => event.stopPropagation()

type Option = { value: string; label: React.ReactNode; note?: string; warn?: boolean; disabled?: boolean; current: boolean; onSelect: () => void }

function StatusMenu({ title, trigger, options }: { title: string; trigger: React.ReactNode; options: Option[] }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={stop}>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72" onClick={stop}>
        <DropdownMenuLabel className="font-mono text-overline tracking-wider text-gray-600 uppercase">{title}</DropdownMenuLabel>
        {options.map((o) => (
          <DropdownMenuItem key={o.value} disabled={o.disabled} onSelect={o.onSelect} title={o.note} className="flex-col items-stretch gap-1 data-disabled:opacity-90">
            <span className="flex items-center gap-2">
              {o.label}
              {o.warn && <TriangleAlertIcon className="size-3.5 text-warning-solid" />}
              <span className="flex-1" />
              {o.current && <CheckIcon className="size-3.5 text-primary" />}
            </span>
            {o.note && <span className={cn("text-caption", o.warn ? "text-warning-fg" : "text-gray-600")}>{o.note}</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/** Why Done / In progress need attention, per FR-WKF-001 and FR-WKF-003. */
function devOptionNote(fr: FrRow, status: DevStatus, permissions: FrPermissions): Pick<Option, "note" | "warn" | "disabled"> {
  if (status === DevStatus.Done) {
    const gate = devDoneGate(fr.acs, permissions)
    if (gate.kind === "override") return { warn: true, note: `Override needed: ${gate.pending} of ${gate.total} acceptance criteria are not dev-done.` }
    if (gate.kind === "blocked") return { disabled: true, note: `${gate.pending} of ${gate.total} acceptance criteria are not yet dev-done.` }
  }
  if (status === DevStatus.InProgress && fr.dev !== status) {
    const note = inProgressWarning(fr)
    if (note) return { warn: true, note }
  }
  return {}
}

/** Dev status picker with Dev-Done gating and override hints (FR-WKF-001). */
export function DevStatusMenu({ fr, trigger }: { fr: FrRow; trigger: React.ReactNode }) {
  const { permissions, requestDevStatus } = useFrActions()
  const options = DEV_STATUSES.map((status) => ({
    value: status,
    label: <DevStatusPill status={status} />,
    current: fr.dev === status,
    onSelect: () => requestDevStatus(fr, status),
    ...devOptionNote(fr, status, permissions),
  }))
  return <StatusMenu title="Dev status" trigger={trigger} options={options} />
}

/** QA status picker; Passed warns when ACs haven't passed, Failed notifies developers (FR-WKF-002). */
export function QaStatusMenu({ fr, trigger }: { fr: FrRow; trigger: React.ReactNode }) {
  const { requestQaStatus } = useFrActions()
  const unpassed = fr.acs.filter((ac) => !ac.qaPassed).length
  const options = QA_STATUSES.map((status) => {
    const warn = status === QaStatus.Passed && unpassed > 0
    const note = warn
      ? `${unpassed} of ${fr.acs.length} ACs have not passed. You'll be asked to confirm.`
      : status === QaStatus.Failed ? "Notifies the assigned developers." : undefined
    return { value: status, label: <QaStatusPill status={status} />, current: fr.qa === status, warn, note, onSelect: () => requestQaStatus(fr, status) }
  })
  return <StatusMenu title="QA status" trigger={trigger} options={options} />
}

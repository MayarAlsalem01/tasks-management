"use client"

import { TriangleAlertIcon } from "lucide-react"
import type * as React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Role } from "@/lib/auth/roles"

import { setFrArchivedAction, updateFrFieldsAction } from "../actions/requirement-actions"
import type { FrRow } from "../types/requirement"
import type { FrFieldsInput } from "../types/schemas"
import { PRIORITY_LABEL, SPEC_STATUS_LABEL, SpecStatus, type Priority } from "../types/status"
import { formatIsoDate } from "../utils/dates"
import type { FrPermissions } from "../utils/permissions"
import { AssigneeMenu } from "./assignee-menu"
import { useFr } from "./fr-context"
import { InlineText } from "./inline-text"
import { AssigneeSummary, MenuTrigger } from "./menu-trigger"
import { DevStatusMenu, QaStatusMenu } from "./status-menus"
import { DevStatusPill, PriorityLabel, QaStatusPill, SpecStatusLabel } from "./status-pills"

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <>
      <span className="text-gray-600">{label}</span>
      <span className="min-w-0">{children}</span>
    </>
  )
}

function ChoiceSelect<T extends string>({ value, labels, onChange, label }: { value: T; labels: Record<T, string>; onChange: (v: T) => void; label: string }) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as T)}>
      <SelectTrigger aria-label={label} className="h-[30px] w-45 bg-white"><SelectValue /></SelectTrigger>
      <SelectContent>
        {(Object.keys(labels) as T[]).map((key) => <SelectItem key={key} value={key}>{labels[key]}</SelectItem>)}
      </SelectContent>
    </Select>
  )
}

/**
 * Details tab: metadata grid. Admin/PO edit everything; Developers and QA only see their own
 * status as a menu and everything else as text (Role Variants spec).
 */
export function FrDetailsTab({ fr, permissions, canArchive }: { fr: FrRow; permissions: FrPermissions; canArchive: boolean }) {
  const { run } = useFr()
  const manage = permissions.canManage
  const save = (fields: FrFieldsInput) =>
    run(fr.id, () => updateFrFieldsAction({ frId: fr.id, fields }), { patch: { fr: fields } })
  const archive = (archived: boolean) =>
    run(fr.id, () => setFrArchivedAction({ frId: fr.id, archived }), { patch: { fr: { archived } }, success: archived ? `${fr.code} archived` : `${fr.code} restored` })

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-[110px_minmax(0,1fr)] items-center gap-x-3 gap-y-2.5 text-ui">
        <Row label="Priority">{manage ? <ChoiceSelect label="Priority" value={fr.priority} labels={PRIORITY_LABEL} onChange={(priority: Priority) => save({ priority })} /> : <PriorityLabel priority={fr.priority} />}</Row>
        <Row label="Spec status">{manage ? <ChoiceSelect label="Spec status" value={fr.spec} labels={SPEC_STATUS_LABEL} onChange={(spec) => save({ spec })} /> : <SpecStatusLabel status={fr.spec} />}</Row>
        <Row label="Dev status">{permissions.canEditDev ? <DevStatusMenu fr={fr} trigger={<MenuTrigger variant="field" aria-label="Dev status"><DevStatusPill status={fr.dev} /></MenuTrigger>} /> : <DevStatusPill status={fr.dev} />}</Row>
        <Row label="QA status">{permissions.canEditQa ? <QaStatusMenu fr={fr} trigger={<MenuTrigger variant="field" aria-label="QA status"><QaStatusPill status={fr.qa} /></MenuTrigger>} /> : <QaStatusPill status={fr.qa} />}</Row>
        <Row label="Developer">{manage ? <AssigneeMenu fr={fr} role={Role.Developer} trigger={<MenuTrigger variant="field" aria-label="Developers"><AssigneeSummary people={fr.developers} full /></MenuTrigger>} /> : <AssigneeSummary people={fr.developers} full />}</Row>
        <Row label="QA engineer">{manage ? <AssigneeMenu fr={fr} role={Role.Qa} trigger={<MenuTrigger variant="field" aria-label="QA engineers"><AssigneeSummary people={fr.qaEngineers} full /></MenuTrigger>} /> : <AssigneeSummary people={fr.qaEngineers} full />}</Row>
        <Row label="Target date">
          {manage ? (
            <Input type="date" aria-label="Target date" defaultValue={fr.targetDate ?? ""} key={fr.targetDate} className="h-[30px] w-45 bg-white font-mono" onChange={(e) => save({ targetDate: e.target.value || null })} />
          ) : (
            <span className="font-mono text-caption">{fr.targetDate ? formatIsoDate(fr.targetDate, { withYear: true }) : "—"}</span>
          )}
        </Row>
      </div>
      <Section label="Description">
        {manage ? <InlineText multiline rows={4} label="Description" value={fr.description} placeholder="What it must do" onSave={(description) => save({ description })} /> : <p className="text-ui whitespace-pre-wrap text-pretty">{fr.description || "—"}</p>}
      </Section>
      <Section label="Open issues">
        {manage ? <InlineText multiline label="Open issues" value={fr.openIssues ?? ""} placeholder="Questions or blockers to resolve" onSave={(openIssues) => save({ openIssues: openIssues || null })} /> : <p className="text-ui whitespace-pre-wrap">{fr.openIssues || "None"}</p>}
      </Section>
      {fr.spec === SpecStatus.PendingReview && (
        <p role="status" className="flex gap-2.5 rounded-lg border border-warning-border bg-warning-bg px-3 py-2.5 text-ui text-warning-strong">
          <TriangleAlertIcon className="mt-0.5 size-4 flex-none text-warning-solid" />
          Spec is pending review. Work can start, but requirement text may still change.
        </p>
      )}
      {!canArchive && <p className="text-caption text-gray-600">Requirement text, priority, spec status, assignees and target date are managed by the Product Owner.</p>}
      {canArchive && (
        <div className="border-t border-gray-75 pt-3">
          {fr.archived ? <Button variant="outline" onClick={() => archive(false)}>Restore requirement</Button> : <Button variant="ghost" className="text-danger-fg" onClick={() => archive(true)}>Archive requirement</Button>}
        </div>
      )}
    </div>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="font-mono text-overline tracking-wider text-gray-500 uppercase">{label}</span>
      {children}
    </div>
  )
}

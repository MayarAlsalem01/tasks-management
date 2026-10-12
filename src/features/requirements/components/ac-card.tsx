"use client"

import { cn } from "cn"
import { ArchiveIcon, ChevronDownIcon, ChevronUpIcon, PencilIcon } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"

import { archiveAcAction, moveAcAction, updateAcAction } from "../actions/requirement-actions"
import type { AcRow, FrComment, FrRow } from "../types/requirement"
import { DevStatus, QaStatus } from "../types/status"
import type { FrPermissions } from "../utils/permissions"
import { AcChecks } from "./ac-checks"
import { AcEditor } from "./ac-editor"
import { useFr } from "./fr-context"
import { DevGlyph } from "./status-glyphs"
import { QaStatusPill } from "./status-pills"

const CLAUSE_LABELS = ["GIVEN", "WHEN", "THEN"] as const

function AcText({ ac }: { ac: AcRow }) {
  if (!ac.given || !ac.when || !ac.then) return <p className="text-ui text-pretty">{ac.text}</p>
  const clauses = [ac.given, ac.when, ac.then]
  return (
    <div className="grid grid-cols-[48px_minmax(0,1fr)] gap-y-0.5 text-ui">
      {CLAUSE_LABELS.map((label, i) => (
        <span key={label} className="contents">
          <span className="pt-px font-mono text-overline tracking-normal text-gray-500">{label}</span>
          <span>{clauses[i]}</span>
        </span>
      ))}
    </div>
  )
}

function AdminActions({ fr, ac, index, count, onEdit }: { fr: FrRow; ac: AcRow; index: number; count: number; onEdit: () => void }) {
  const { run } = useFr()
  const move = (direction: -1 | 1) => run(fr.id, () => moveAcAction({ acId: ac.id, direction }))
  const archive = () => run(fr.id, () => archiveAcAction({ acId: ac.id }), { success: `${ac.code} archived. It stays in the audit log.` })
  return (
    <span className="flex gap-0.5">
      <Button variant="ghost" size="icon-sm" aria-label="Move up" disabled={index === 0} onClick={() => move(-1)}><ChevronUpIcon /></Button>
      <Button variant="ghost" size="icon-sm" aria-label="Move down" disabled={index === count - 1} onClick={() => move(1)}><ChevronDownIcon /></Button>
      <Button variant="ghost" size="icon-sm" aria-label="Edit criterion" onClick={onEdit}><PencilIcon /></Button>
      <Button variant="ghost" size="icon-sm" aria-label="Archive criterion" onClick={archive}><ArchiveIcon /></Button>
    </span>
  )
}

type AcCardProps = {
  fr: FrRow
  ac: AcRow
  index: number
  count: number
  permissions: FrPermissions
  /** The defect comment that made this AC fail, if any. */
  defect?: FrComment
  /** Called after QA reports a defect or un-passes this AC (FR-WKF-002 prompt). */
  onDefect: (code: string) => void
}

/** One acceptance criterion: GWT text, admin reorder/edit/archive, defect note, dev/QA checks. */
export function AcCard({ fr, ac, index, count, permissions, defect, onDefect }: AcCardProps) {
  const { run } = useFr()
  const [editing, setEditing] = useState(false)
  const qa = ac.qaFailed ? QaStatus.Failed : ac.qaPassed ? QaStatus.Passed : QaStatus.NotTested

  return (
    <div className={cn("flex flex-col gap-2.5 rounded-lg border p-3", ac.qaFailed ? "border-danger-border bg-danger-subtle" : "border-gray-150 bg-white")}>
      <div className="flex items-center gap-2">
        <span className="font-mono text-caption font-medium text-gray-700">{ac.code}</span>
        <span className="flex-1" />
        {permissions.canManage && !editing && <AdminActions fr={fr} ac={ac} index={index} count={count} onEdit={() => setEditing(true)} />}
      </div>
      {editing ? (
        <AcEditor
          initial={{ given: ac.given ?? "", when: ac.when ?? "", then: ac.then ?? ac.text }}
          onCancel={() => setEditing(false)}
          onSave={(text) => run(fr.id, () => updateAcAction({ acId: ac.id, ...text }))}
        />
      ) : (
        <AcText ac={ac} />
      )}
      {ac.qaFailed && defect && (
        <div className="flex flex-col gap-1 rounded-md border border-danger-border bg-white px-2.5 py-2">
          <span className="flex items-center gap-2 text-caption">
            <span className="font-semibold text-danger-fg">Defect</span>
            <span className="text-gray-600">{defect.author.fullName}</span>
          </span>
          <p className="text-ui whitespace-pre-wrap">{defect.body}</p>
        </div>
      )}
      <AcChecks
        fr={fr}
        ac={ac}
        permissions={permissions}
        onDefect={onDefect}
        devText={
          <span className={cn("inline-flex items-center gap-1.5 text-caption", ac.devDone ? "text-success-fg" : "text-gray-600")}>
            <DevGlyph status={ac.devDone ? DevStatus.Done : DevStatus.NotStarted} />
            {ac.devDone ? "Dev done" : "Not dev-done"}
          </span>
        }
        qaPill={<QaStatusPill status={qa} label={qa === QaStatus.NotTested ? "Not yet tested" : undefined} />}
      />
    </div>
  )
}

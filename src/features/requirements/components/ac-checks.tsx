"use client"

import { cn } from "cn"
import { CheckIcon } from "lucide-react"
import type * as React from "react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

import { reportDefectAction, setAcDevDoneAction, setAcQaPassedAction } from "../actions/requirement-actions"
import type { AcRow, FrRow } from "../types/requirement"
import type { FrPermissions } from "../utils/permissions"
import { useFr } from "./fr-context"

function CheckButton({ checked, tone, onClick, children }: { checked: boolean; tone: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onClick}
      className="inline-flex h-7 items-center gap-2 rounded-md border border-input bg-white px-2 text-caption font-medium outline-none hover:bg-gray-25 focus-visible:shadow-focus"
    >
      <span className={cn("inline-flex size-4 items-center justify-center rounded-xs", checked ? tone : "border-[1.5px] border-gray-400 bg-white")}>
        {checked && <CheckIcon className="size-2.5 text-white" strokeWidth={3} />}
      </span>
      {children}
    </button>
  )
}

type AcChecksProps = {
  fr: FrRow
  ac: AcRow
  permissions: FrPermissions
  onDefect: (code: string) => void
  /** Read-only dev state, shown to people who can't tick "Dev done". */
  devText: React.ReactNode
  qaPill: React.ReactNode
}

/**
 * The AC footer: "Dev done" for Developers and Admin/PO; "QA passed" and "Report defect" for
 * QA and Admin/PO (FRS §2). Reporting a defect or un-passing an AC triggers the drawer's
 * "Set QA status to Failed?" prompt (FR-WKF-002).
 */
export function AcChecks({ fr, ac, permissions, onDefect, devText, qaPill }: AcChecksProps) {
  const { run } = useFr()
  const [defectOpen, setDefectOpen] = useState(false)
  const [note, setNote] = useState("")

  const toggleDev = () =>
    run(fr.id, () => setAcDevDoneAction({ acId: ac.id, value: !ac.devDone }), { patch: { ac: { id: ac.id, changes: { devDone: !ac.devDone } } } })

  const toggleQa = async () => {
    const passed = !ac.qaPassed
    const ok = await run(fr.id, () => setAcQaPassedAction({ acId: ac.id, value: passed }), {
      patch: { ac: { id: ac.id, changes: { qaPassed: passed, ...(passed ? { qaFailed: false } : {}) } } },
    })
    if (ok && !passed) onDefect(ac.code)
  }

  const submitDefect = async () => {
    const ok = await run(fr.id, () => reportDefectAction({ acId: ac.id, note }), { patch: { ac: { id: ac.id, changes: { qaPassed: false, qaFailed: true } } } })
    if (!ok) return
    setDefectOpen(false)
    setNote("")
    onDefect(ac.code)
  }

  return (
    <>
      {defectOpen && (
        <div className="flex flex-col gap-1.5">
          <span className="text-caption font-medium text-danger-fg">Defect note (shown as a comment on this AC)</span>
          <Textarea rows={3} autoFocus value={note} onChange={(e) => setNote(e.target.value)} placeholder="Steps to reproduce, expected vs actual, environment" aria-label="Defect note" className="resize-none border-danger-mark bg-white" />
          <span className="flex justify-end gap-1.5">
            <Button variant="ghost" size="sm" onClick={() => setDefectOpen(false)}>Cancel</Button>
            <Button variant="destructive" size="sm" disabled={!note.trim()} onClick={submitDefect}>Report defect</Button>
          </span>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2 border-t border-gray-75 pt-2">
        {permissions.canEditDev ? <CheckButton checked={ac.devDone} tone="bg-primary" onClick={toggleDev}>Dev done</CheckButton> : devText}
        <span className="flex-1" />
        {permissions.canEditQa && (
          <>
            <CheckButton checked={ac.qaPassed} tone="bg-success-solid" onClick={toggleQa}>QA passed</CheckButton>
            {!ac.qaFailed && !defectOpen && (
              <Button variant="outline" size="sm" className="border-danger-border text-danger-fg hover:bg-danger-bg" onClick={() => setDefectOpen(true)}>Report defect</Button>
            )}
          </>
        )}
        {qaPill}
      </div>
    </>
  )
}

"use client"

import Link from "next/link"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ProjectView, ROUTES, SearchParam, withQuery } from "@/lib/routes"

import { useAcActions } from "../hooks/use-ac-actions"
import type { MyTask, TaskAc } from "../types/my-tasks"
import { DevStatus, QaStatus } from "../types/status"
import { failureNote } from "../utils/my-tasks"
import { CheckButton } from "./ac-checks"
import { DrawerBanner } from "./drawer-banner"
import { useFrActions } from "./fr-context"
import { QaStatusPill } from "./status-pills"

function TaskAcRow({ task, ac, onDefect }: { task: MyTask; ac: TaskAc; onDefect: (code: string) => void }) {
  const { permissions, run } = useFrActions()
  const { toggleDev, toggleQa, reportDefect } = useAcActions(run, task, ac, onDefect)
  const [note, setNote] = useState<string | null>(null)
  const qa = ac.qaFailed ? QaStatus.Failed : ac.qaPassed ? QaStatus.Passed : QaStatus.NotTested

  const submit = async () => {
    if (note !== null && (await reportDefect(note))) setNote(null)
  }

  return (
    <div className="flex flex-col gap-2 border-b border-gray-50 py-1.5 last:border-b-0">
      <div className="grid grid-cols-[48px_minmax(0,1fr)] items-center gap-x-3 gap-y-1.5 md:grid-cols-[48px_minmax(0,1fr)_auto]">
        <span className="font-mono text-caption text-gray-600">{ac.code}</span>
        <span className="text-ui">
          {ac.text}
          {ac.qaFailed && ac.defectNote && <span className="text-danger-fg"> Defect: {ac.defectNote}</span>}
        </span>
        <span className="col-span-2 flex flex-wrap items-center gap-1.5 md:col-span-1">
          {permissions.canEditDev ? (
            <CheckButton checked={ac.devDone} tone="bg-primary" onClick={toggleDev}>Dev done</CheckButton>
          ) : (
            <span className={ac.devDone ? "text-caption text-success-fg" : "text-caption text-gray-600"}>{ac.devDone ? "Dev done" : "Not dev-done"}</span>
          )}
          {permissions.canEditQa && <CheckButton checked={ac.qaPassed} tone="bg-success-solid" onClick={toggleQa}>QA passed</CheckButton>}
          {permissions.canEditQa && !ac.qaFailed && note === null && (
            <Button variant="outline" size="sm" className="border-danger-border text-danger-fg hover:bg-danger-bg" onClick={() => setNote("")}>Report defect</Button>
          )}
          <QaStatusPill status={qa} />
        </span>
      </div>
      {note !== null && (
        <div className="flex items-start gap-2">
          <Textarea rows={2} autoFocus value={note} onChange={(e) => setNote(e.target.value)} placeholder={`Defect note for ${ac.code}`} aria-label="Defect note" className="flex-1 resize-none border-danger-mark bg-white" />
          <span className="flex flex-col gap-1.5">
            <Button variant="destructive" size="sm" disabled={!note.trim()} onClick={submit}>Report defect</Button>
            <Button variant="ghost" size="sm" onClick={() => setNote(null)}>Cancel</Button>
          </span>
        </div>
      )}
    </div>
  )
}

/**
 * A My Tasks row's expanded panel: the blocker or QA-failure note, each AC with the checks
 * the viewer's roles allow, and the drawer's "Set QA status to Failed?" prompt after a defect
 * (FR-WKF-002). Links to the FR in its project table for everything else.
 */
export function TaskAcs({ task }: { task: MyTask }) {
  const { permissions, requestQaStatus } = useFrActions()
  const [defectOn, setDefectOn] = useState<string | null>(null)
  const blockedNote = task.dev === DevStatus.Blocked ? (task.notes ?? task.openIssues) : null
  const note = blockedNote ? `Blocked: ${blockedNote}` : task.qa === QaStatus.Failed ? failureNote(task) : null

  return (
    <div className="flex flex-col gap-1.5 border-b border-gray-75 bg-gray-25/40 py-2 pr-4 pl-4 md:pl-13">
      {note && <div className="rounded-md bg-danger-bg px-2.5 py-1.5 text-caption text-danger-strong">{note}</div>}
      {task.acs.length ? (
        task.acs.map((ac) => <TaskAcRow key={ac.id} task={task} ac={ac} onDefect={setDefectOn} />)
      ) : (
        <p className="py-1.5 text-caption text-gray-600">No acceptance criteria yet.</p>
      )}
      {permissions.canEditQa && defectOn && task.qa !== QaStatus.Failed && (
        <DrawerBanner
          tone="warning"
          actions={
            <>
              <Button size="sm" variant="warning" onClick={() => { requestQaStatus(task, QaStatus.Failed); setDefectOn(null) }}>Set to Failed</Button>
              <Button size="sm" variant="ghost" onClick={() => setDefectOn(null)}>Ignore</Button>
            </>
          }
        >
          <b className="font-semibold">Defect detected on {defectOn}:</b> Set requirement QA status to Failed?
        </DrawerBanner>
      )}
      <Link href={withQuery(ROUTES.project(task.project.code, ProjectView.Table), { [SearchParam.Fr]: task.code })} className="pt-1 text-caption text-cobalt-600 hover:text-cobalt-700 hover:underline">
        Open in project drawer ↗
      </Link>
    </div>
  )
}

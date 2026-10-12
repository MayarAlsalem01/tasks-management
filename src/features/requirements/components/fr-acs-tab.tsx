"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { percent } from "@/lib/progress"

import { createAcAction } from "../actions/requirement-actions"
import type { FrComment, FrRow } from "../types/requirement"
import { DevStatus, QaStatus } from "../types/status"
import type { FrPermissions } from "../utils/permissions"
import { AcCard } from "./ac-card"
import { AcEditor } from "./ac-editor"
import { ProgressBar } from "./ac-progress"
import { DrawerBanner } from "./drawer-banner"
import { useFr } from "./fr-context"

function Meter({ label, done, total, tone }: { label: string; done: number; total: number; tone: string }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-lg border border-gray-150 px-3 py-2.5">
      <span className="flex justify-between text-caption">
        <span className="font-semibold">{label}</span>
        <span className="font-mono text-gray-700">{done}/{total}</span>
      </span>
      <ProgressBar value={percent(done, total)} tone={tone} className="h-1.5" />
    </div>
  )
}

/**
 * Acceptance criteria tab: Dev/QA progress, the assisted prompts of FR-WKF-001/002
 * ("Mark as Done", "Set QA status to Failed?", "Mark as Passed?"), the AC cards and Add AC.
 */
export function FrAcsTab({ fr, permissions, comments }: { fr: FrRow; permissions: FrPermissions; comments: FrComment[] }) {
  const { run, requestDevStatus, requestQaStatus } = useFr()
  const [adding, setAdding] = useState(false)
  const [defectOn, setDefectOn] = useState<string | null>(null)
  const [keepTesting, setKeepTesting] = useState(false)

  const total = fr.acs.length
  const devDone = fr.acs.filter((ac) => ac.devDone).length
  const qaPassed = fr.acs.filter((ac) => ac.qaPassed).length
  const showDone = permissions.canEditDev && total > 0 && devDone === total && fr.dev !== DevStatus.Done
  const showFail = permissions.canEditQa && defectOn !== null && fr.qa !== QaStatus.Failed
  const showPass = permissions.canEditQa && total > 0 && qaPassed === total && fr.qa !== QaStatus.Passed && !keepTesting
  const defectFor = (code: string) => comments.findLast((c) => c.isDefect && c.acCode === code)

  return (
    <div className="flex flex-col gap-3.5">
      <div className="grid grid-cols-2 gap-2.5">
        <Meter label="Dev" done={devDone} total={total} tone="bg-primary" />
        <Meter label="QA" done={qaPassed} total={total} tone="bg-success-solid" />
      </div>
      {showDone && (
        <DrawerBanner tone="success" actions={<Button size="sm" className="bg-success-solid hover:bg-success-strong" onClick={() => requestDevStatus(fr, DevStatus.Done)}>Mark as Done</Button>}>
          <b className="font-semibold">All ACs are dev-done.</b> You can now mark this FR as Done.
        </DrawerBanner>
      )}
      {showFail && (
        <DrawerBanner
          tone="warning"
          actions={
            <>
              <Button size="sm" variant="warning" onClick={() => { requestQaStatus(fr, QaStatus.Failed); setDefectOn(null) }}>Set to Failed</Button>
              <Button size="sm" variant="ghost" onClick={() => setDefectOn(null)}>Ignore</Button>
            </>
          }
        >
          <b className="font-semibold">Defect detected on {defectOn}:</b> Set requirement QA status to Failed?
        </DrawerBanner>
      )}
      {showPass && (
        <DrawerBanner
          tone="verified"
          actions={
            <>
              <Button size="sm" className="bg-success-solid hover:bg-success-strong" onClick={() => requestQaStatus(fr, QaStatus.Passed)}>Mark as Passed</Button>
              <Button size="sm" variant="ghost" onClick={() => setKeepTesting(true)}>Keep in testing</Button>
            </>
          }
        >
          <b className="font-semibold">All criteria verified:</b> All {total} ACs have passed. Update FR status to Passed?
        </DrawerBanner>
      )}
      <div className="flex flex-col gap-2.5">
        {fr.acs.map((ac, index) => (
          <AcCard key={ac.id} fr={fr} ac={ac} index={index} count={total} permissions={permissions} defect={defectFor(ac.code)} onDefect={setDefectOn} />
        ))}
        {total === 0 && !adding && <p className="py-2 text-ui text-gray-600">No acceptance criteria yet.</p>}
        {adding && (
          <div className="rounded-lg border border-gray-150 p-3">
            <AcEditor onCancel={() => setAdding(false)} onSave={(text) => run(fr.id, () => createAcAction({ frId: fr.id, ...text }))} />
          </div>
        )}
        {permissions.canManage && !adding && (
          <button type="button" onClick={() => setAdding(true)} className="h-[34px] rounded-lg border border-dashed border-gray-300 bg-white text-ui font-medium text-gray-700 outline-none hover:bg-gray-25 focus-visible:shadow-focus">
            + Add acceptance criterion
          </button>
        )}
      </div>
    </div>
  )
}

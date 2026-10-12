"use client"

import { reportDefectAction, setAcDevDoneAction, setAcQaPassedAction } from "../actions/requirement-actions"
import type { AcRow, FrRow } from "../types/requirement"
import type { RunMutation } from "./use-fr-mutations"

/**
 * The per-AC writes shared by the drawer and My Tasks, with optimistic patches: toggle
 * "Dev done", toggle "QA passed" and report a defect. `onDefect` fires after un-passing an
 * AC or reporting a defect, so the caller can offer "Set QA status to Failed?" (FR-WKF-002).
 * `toggleQa` and `reportDefect` resolve to whether the write succeeded.
 */
export function useAcActions(run: RunMutation, fr: Pick<FrRow, "id">, ac: AcRow, onDefect: (code: string) => void) {
  const toggleDev = () =>
    run(fr.id, () => setAcDevDoneAction({ acId: ac.id, value: !ac.devDone }), { patch: { ac: { id: ac.id, changes: { devDone: !ac.devDone } } } })

  const toggleQa = async () => {
    const passed = !ac.qaPassed
    const ok = await run(fr.id, () => setAcQaPassedAction({ acId: ac.id, value: passed }), {
      patch: { ac: { id: ac.id, changes: { qaPassed: passed, ...(passed ? { qaFailed: false } : {}) } } },
    })
    if (ok && !passed) onDefect(ac.code)
    return ok
  }

  const reportDefect = async (note: string) => {
    const ok = await run(fr.id, () => reportDefectAction({ acId: ac.id, note }), { patch: { ac: { id: ac.id, changes: { qaPassed: false, qaFailed: true } } } })
    if (ok) onDefect(ac.code)
    return ok
  }

  return { toggleDev, toggleQa, reportDefect }
}

"use client"

import { useState } from "react"
import { toast } from "sonner"

import { setDevStatusAction, setQaStatusAction } from "../actions/requirement-actions"
import type { FrRow } from "../types/requirement"
import type { OverrideRequest } from "../types/schemas"
import { DEV_STATUS_LABEL, DevStatus, QA_STATUS_LABEL, QaStatus } from "../types/status"
import { devDoneGate, type FrPermissions } from "../utils/permissions"
import type { RunMutation } from "./use-fr-mutations"

/**
 * The status-change workflow shared by table cells, the drawer and its banners:
 * Dev → Done goes through the gate and opens the override dialog for Admin/PO
 * (FR-WKF-001); QA → Passed with unpassed ACs opens a confirmation (FR-WKF-002).
 */
export function useStatusFlow(run: RunMutation, permissions: FrPermissions) {
  const [overrideFr, setOverrideFr] = useState<FrRow | null>(null)
  const [confirmPassedFr, setConfirmPassedFr] = useState<FrRow | null>(null)

  const commitDev = (fr: FrRow, status: DevStatus, override?: OverrideRequest) =>
    run(fr.id, () => setDevStatusAction({ frId: fr.id, status, override }), {
      patch: { fr: { dev: status, ...(override?.markAllAcs ? { acs: fr.acs.map((ac) => ({ ...ac, devDone: true })) } : {}) } },
      success: override ? "Marked Done by override. Recorded in the audit log." : `Dev status set to ${DEV_STATUS_LABEL[status]}`,
    })

  const requestDevStatus = (fr: FrRow, status: DevStatus) => {
    if (status !== DevStatus.Done) return void commitDev(fr, status)
    const gate = devDoneGate(fr.acs, permissions)
    if (gate.kind === "override") return setOverrideFr(fr)
    if (gate.kind === "blocked") return void toast.error(`${gate.pending} of ${gate.total} acceptance criteria aren't dev-done yet.`)
    void commitDev(fr, status)
  }

  const commitQa = (fr: FrRow, status: QaStatus) =>
    run(fr.id, () => setQaStatusAction({ frId: fr.id, status }), {
      patch: { fr: { qa: status } },
      success: status === QaStatus.Failed && fr.developers.length ? "QA status set to Failed. The developers were notified." : `QA status set to ${QA_STATUS_LABEL[status]}`,
    })

  const requestQaStatus = (fr: FrRow, status: QaStatus) => {
    if (status === QaStatus.Passed && fr.acs.some((ac) => !ac.qaPassed)) return setConfirmPassedFr(fr)
    void commitQa(fr, status)
  }

  return {
    requestDevStatus,
    requestQaStatus,
    overrideFr,
    confirmPassedFr,
    confirmOverride: (input: OverrideRequest) => {
      if (overrideFr) void commitDev(overrideFr, DevStatus.Done, input)
      setOverrideFr(null)
    },
    confirmPassed: () => {
      if (confirmPassedFr) void commitQa(confirmPassedFr, QaStatus.Passed)
      setConfirmPassedFr(null)
    },
    closeDialogs: () => {
      setOverrideFr(null)
      setConfirmPassedFr(null)
    },
  }
}

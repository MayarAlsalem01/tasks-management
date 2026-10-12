"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"

import type { FrRow } from "../types/requirement"
import { DevStatus } from "../types/status"
import { dropKind } from "../utils/board"
import { inProgressWarning, type FrPermissions } from "../utils/permissions"

/** A Done drop the gate refused: shown as an alert above the board until dismissed. */
export type RejectedDrop = { code: string; pending: number; total: number; from: DevStatus }

const SHAKE_MS = 600

/**
 * Drag-and-drop between the board's dev-status columns (native HTML5 DnD). Tracks the card
 * being dragged and the column under it for drop hints. A drop runs the shared status flow
 * (`requestDevStatus`: optimistic move, override dialog for Admin/PO), except a Done drop the
 * gate blocks (FR-WKF-001), which shakes the card and sets `rejected` instead of moving it.
 */
export function useBoardDrag(rows: readonly FrRow[], permissions: FrPermissions, requestDevStatus: (fr: FrRow, status: DevStatus) => void) {
  const [dragId, setDragId] = useState<string | null>(null)
  const [over, setOver] = useState<DevStatus | null>(null)
  const [rejected, setRejected] = useState<RejectedDrop | null>(null)
  const [shakeId, setShakeId] = useState<string | null>(null)

  useEffect(() => {
    if (!shakeId) return
    const timer = setTimeout(() => setShakeId(null), SHAKE_MS)
    return () => clearTimeout(timer)
  }, [shakeId])

  const end = () => {
    setDragId(null)
    setOver(null)
  }

  const drop = (status: DevStatus) => {
    const fr = rows.find((r) => r.id === dragId)
    end()
    if (!fr || !permissions.canEditDev) return
    const kind = dropKind(fr, status, permissions)
    if (kind === "same") return
    if (kind === "blocked") {
      setRejected({ code: fr.code, pending: fr.acs.filter((ac) => !ac.devDone).length, total: fr.acs.length, from: fr.dev })
      setShakeId(fr.id)
      return
    }
    setRejected(null)
    requestDevStatus(fr, status)
    const warning = status === DevStatus.InProgress ? inProgressWarning(fr) : undefined
    if (warning) toast.warning(`Moved to In progress. ${warning}`)
  }

  return {
    dragged: rows.find((r) => r.id === dragId) ?? null,
    over,
    rejected,
    shakeId,
    start: (fr: FrRow) => {
      // Defer the re-render: restyling the card during dragstart would bake the faded
      // "lifted" look into the browser's drag image.
      setTimeout(() => {
        setDragId(fr.id)
        setRejected(null)
      }, 0)
    },
    enter: (status: DevStatus) => setOver(status),
    end,
    drop,
    dismiss: () => setRejected(null),
  }
}

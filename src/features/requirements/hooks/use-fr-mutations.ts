"use client"

import { useQueryClient } from "@tanstack/react-query"
import { startTransition, useOptimistic } from "react"
import { toast } from "sonner"

import type { ActionState } from "@/lib/action-state"
import { GENERIC_ERROR_MESSAGE } from "@/lib/errors"

import { requirementKeys } from "../cache/query-keys"
import type { AcRow, FrRow } from "../types/requirement"

/** An optimistic change to one FR row and/or one of its ACs. */
export type FrPatch = { fr?: Partial<FrRow>; ac?: { id: string; changes: Partial<AcRow> } }

// Rows may extend FrRow (My Tasks adds project and defect data); patches keep those fields.
function applyPatch<T extends FrRow>(rows: T[], { frId, fr, ac }: FrPatch & { frId: string }): T[] {
  return rows.map((row) => {
    if (row.id !== frId) return row
    const acs = fr?.acs ?? row.acs
    return { ...row, ...fr, acs: ac ? acs.map((a) => (a.id === ac.id ? { ...a, ...ac.changes } : a)) : acs } as T
  })
}

export type RunOptions = { patch?: FrPatch; success?: string }

/** Runs one requirement Server Action; resolves to whether it succeeded. */
export type RunMutation = (frId: string, action: () => Promise<ActionState>, options?: RunOptions) => Promise<boolean>

/**
 * The table's single mutation path: applies an optimistic patch so cells change instantly,
 * runs the Server Action (which revalidates the server data that replaces the patch), shows
 * a toast for errors (and `success`, when given), and refreshes the FR's drawer detail.
 */
export function useFrMutations<T extends FrRow>(rows: T[]) {
  const [optimisticRows, addPatch] = useOptimistic(rows, applyPatch<T>)
  const queryClient = useQueryClient()

  const run: RunMutation = (frId, action, { patch, success } = {}) =>
    new Promise((resolve) => {
      startTransition(async () => {
        if (patch) addPatch({ frId, ...patch })
        const result = await action()
        void queryClient.invalidateQueries({ queryKey: requirementKeys.detail(frId) })
        if (result.status === "error") {
          toast.error(result.message ?? GENERIC_ERROR_MESSAGE)
          resolve(false)
          return
        }
        if (success) toast.success(success)
        resolve(true)
      })
    })

  return { rows: optimisticRows, run }
}

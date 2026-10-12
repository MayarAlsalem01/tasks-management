"use client"

import { useQuery } from "@tanstack/react-query"

import { getFrDetailAction } from "../actions/requirement-actions"
import { requirementKeys } from "../cache/query-keys"

/**
 * The drawer's Discussion and Audit data, fetched after the drawer opens (React Query over a
 * Server Action). Mutations invalidate `requirementKeys.detail(frId)` to refresh it.
 */
export function useFrDetail(frId: string) {
  return useQuery({
    queryKey: requirementKeys.detail(frId),
    queryFn: async () => {
      const result = await getFrDetailAction(frId)
      if (result.status === "error") throw new Error(result.message)
      return result.detail
    },
  })
}

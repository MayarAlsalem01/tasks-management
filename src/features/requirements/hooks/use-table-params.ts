"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { FILTER_KEYS, parseTableParams } from "../utils/table-params"

type Changes = Record<string, string | undefined>

/**
 * Project-table state (filters, grouping, archived toggle, open drawer and tab, create
 * dialogs) kept in the URL, so views are shareable and survive Next's preserved route state.
 * `update` merges changes into the query string; `undefined` or "" removes a key.
 */
export function useTableParams() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const update = (changes: Changes) => {
    const next = new URLSearchParams(searchParams)
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value)
      else next.delete(key)
    }
    const query = next.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  const clearFilters = () => update(Object.fromEntries(FILTER_KEYS.map((key) => [key, undefined])))

  return { params: parseTableParams(searchParams), update, clearFilters }
}

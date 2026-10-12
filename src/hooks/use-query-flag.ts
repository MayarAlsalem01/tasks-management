"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"

/**
 * A boolean URL flag such as `?new=1`, used to open dialogs from links. The URL is the only
 * source of truth: Next.js keeps visited pages' state alive, so copying the flag into
 * `useState` would leave a reopened page with stale (closed) state. `clear` removes just
 * this flag and keeps the other query params (e.g. filters).
 */
export function useQueryFlag(key: string) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isOn = searchParams.get(key) === "1"

  const clear = () => {
    const params = new URLSearchParams(searchParams)
    params.delete(key)
    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  return [isOn, clear] as const
}

"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState, type ReactNode } from "react"

/**
 * React Query client for client-side fetching (FRS: TanStack Query with optimistic updates).
 * Server Components still load data on the server through cached queries; use React Query
 * only for data a client component must fetch or poll after the first render.
 */
export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: 60_000, refetchOnWindowFocus: false } } }),
  )
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

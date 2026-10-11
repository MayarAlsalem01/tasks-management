"use client"

import { ErrorState } from "@/components/ui/error-state"

export default function ErrorPage(props: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <main className="flex flex-1 items-center justify-center p-4">
      <ErrorState {...props} context="app/error" />
    </main>
  )
}

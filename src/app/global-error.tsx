"use client"

import { ErrorState } from "@/components/ui/error-state"

import "./globals.css"

// Replaces the root layout when it fails, so it renders its own <html> and <body>.
export default function GlobalError(props: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="en">
      <body className="flex min-h-svh items-center justify-center bg-gray-25 p-4">
        <ErrorState {...props} context="app/global-error" />
      </body>
    </html>
  )
}

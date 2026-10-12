import type { ReactNode } from "react"

import { APP_MARK, APP_NAME } from "@/lib/config"

function LogoMark({ className }: { className: string }) {
  return (
    <span
      aria-hidden
      className={`inline-flex items-center justify-center bg-cobalt-500 font-mono font-semibold text-white ${className}`}
    >
      {APP_MARK}
    </span>
  )
}

/** Shared frame for the signed-out screens: brand bar, logo, heading, a card slot and a footer. */
export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle: string
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <div className="flex min-h-svh flex-col bg-gray-25">
      <header className="hidden items-center gap-2 px-6 py-4 sm:flex">
        <LogoMark className="size-5.5 rounded-md text-caption" />
        <span className="text-body font-semibold">{APP_NAME}</span>
      </header>

      <main className="flex flex-1 justify-center px-4 pt-10 pb-6 sm:items-center sm:pt-6 sm:pb-16">
        <div className="flex w-full max-w-100 flex-col gap-6">
          <div className="flex flex-col items-start gap-1.5">
            <LogoMark className="mb-2 size-9 rounded-[9px] text-lg" />
            <h1 className="text-display">{title}</h1>
            <p className="text-body text-gray-600">{subtitle}</p>
          </div>
          {children}
          {footer}
        </div>
      </main>
    </div>
  )
}

/** Mobile-first sizing shared by the auth form controls (48px on phones, 36px from `sm`). */
export const authFieldClass =
  "h-12 rounded-lg px-3 disabled:bg-gray-50 disabled:text-gray-500 disabled:opacity-100 max-sm:text-base sm:h-9 sm:rounded-md sm:px-2.5 sm:text-body"
export const authLabelClass = "font-medium text-gray-700 max-sm:text-ui sm:text-caption"
export const authButtonClass = "h-12 rounded-lg max-sm:text-base sm:h-9 sm:rounded-md sm:text-body"
export const authCardClass =
  "flex flex-col gap-4 rounded-xl border border-gray-150 bg-card p-5 shadow-e1 sm:p-6"

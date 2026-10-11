import { SearchIcon } from "lucide-react"
import type { ReactNode } from "react"

import { Kbd } from "@/components/ui/kbd"

import { ComingSoonHint } from "./coming-soon-button"

/**
 * The signed-in frame from the App Shell design. It is static: the frame, search box and
 * bars prerender into the static shell, and each data-dependent region (`sidebar`,
 * `headerActions`, the mobile bars) is passed in already wrapped in its own `<Suspense>`.
 * Pages render into the scrollable main area.
 */
export function AppShell({
  sidebar,
  headerActions,
  mobileTopBar,
  mobileTabBar,
  children,
}: {
  sidebar: ReactNode
  headerActions: ReactNode
  mobileTopBar: ReactNode
  mobileTabBar: ReactNode
  children: ReactNode
}) {
  return (
    <div className="flex h-svh bg-white">
      <aside className="hidden w-62 flex-none flex-col border-r border-gray-150 bg-gray-50 lg:flex">{sidebar}</aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="hidden h-13 flex-none items-center gap-3 border-b border-gray-150 bg-white pr-4 pl-5 lg:flex">
          <ComingSoonHint label="Search is coming soon">
            <span aria-disabled className="flex h-8 w-110 max-w-[40vw] items-center gap-2 rounded-md border border-gray-200 bg-gray-25 pr-2 pl-2.5 text-ui text-gray-500">
              <SearchIcon className="size-3.5" />
              <span className="flex-1">Search FRs, ACs, people…</span>
              <Kbd>⌘K</Kbd>
            </span>
          </ComingSoonHint>
          <span className="flex-1" />
          {headerActions}
        </header>
        {mobileTopBar}
        <main className="flex min-h-0 flex-1 flex-col overflow-auto pb-17 lg:pb-0">{children}</main>
        {mobileTabBar}
      </div>
    </div>
  )
}

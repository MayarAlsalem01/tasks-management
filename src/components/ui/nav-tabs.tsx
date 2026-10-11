"use client"

import { cn } from "cn"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"

import { SearchParam } from "@/lib/routes"

export type NavTab = {
  label: string
  href: string
  count?: number
  /** Marks the tab active; defaults to comparing `href` with the current path and query. */
  active?: boolean
}

function isCurrent(href: string, pathname: string, search: string) {
  const [path, query = ""] = href.split("?")
  if (path !== pathname) return false
  return query ? search.includes(query) : !search.includes(`${SearchParam.Tab}=`)
}

/** Underlined link tabs (Table / Board / Dashboard, Active / Archived) that sit on a header border. */
function NavTabs({ tabs, className }: { tabs: NavTab[]; className?: string }) {
  const pathname = usePathname()
  const search = useSearchParams().toString()

  return (
    <nav className={cn("-mb-px flex gap-1 overflow-x-auto", className)}>
      {tabs.map((tab) => {
        const active = tab.active ?? isCurrent(tab.href, pathname, search)
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex h-9 flex-none items-center px-2.5 text-ui font-medium whitespace-nowrap outline-none focus-visible:shadow-focus",
              active ? "text-foreground shadow-[inset_0_-2px_0_var(--color-cobalt-500)]" : "text-gray-600 hover:text-foreground",
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className="ml-1.5 rounded-xs bg-gray-75 px-1.5 font-mono text-overline text-gray-700">{tab.count}</span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}

export { NavTabs }

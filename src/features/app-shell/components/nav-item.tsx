"use client"

import { cn } from "cn"
import Link from "next/link"
import type { ReactNode } from "react"

/** A sidebar link row (icon, label, optional trailing count) with the active background. */
export function NavItem({
  href,
  icon,
  label,
  active,
  trailing,
}: {
  href: string
  icon: ReactNode
  label: string
  active: boolean
  trailing?: ReactNode
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-7.5 items-center gap-2.5 rounded-md px-2 text-ui font-medium outline-none focus-visible:shadow-focus [&_svg]:size-4",
        active ? "bg-gray-150 text-foreground" : "text-gray-700 hover:bg-gray-100",
      )}
    >
      {icon}
      <span className="flex-1 truncate">{label}</span>
      {trailing}
    </Link>
  )
}

/** Mono, uppercase section label ("Views", "Activities", "Admin") with optional trailing slot. */
export function NavSection({ label, action, children }: { label: string; action?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-px">
      <div className="flex h-6 items-center gap-1.5 px-2">
        <span className="flex-1 font-mono text-[10px] tracking-wider text-gray-600 uppercase">{label}</span>
        {action}
      </div>
      {children}
    </div>
  )
}

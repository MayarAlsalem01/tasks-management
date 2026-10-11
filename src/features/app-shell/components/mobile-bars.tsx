"use client"

import { cn } from "cn"
import { BellIcon, FolderIcon, SquareCheckIcon, UserIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { NotificationsBell, type NotificationItem } from "@/features/notifications"
import type { ProjectNav } from "@/features/projects"

import { pageTitle, parseProjectPath } from "../utils/navigation"
import { ROUTES } from "@/lib/routes"

/** Mobile top bar (below `lg`): page title and the notifications bell. */
export function MobileTopBar({
  navs,
  notifications,
  unreadCount,
}: {
  navs: ProjectNav[]
  notifications: NotificationItem[]
  unreadCount: number
}) {
  const pathname = usePathname()
  const code = parseProjectPath(pathname)?.code
  const title = pageTitle(pathname, navs.find((n) => n.code === code)?.name)
  return (
    <header className="flex h-13 flex-none items-center gap-2 border-b border-gray-150 bg-white pr-2 pl-4 lg:hidden">
      <span className="flex-1 truncate text-title-2 font-semibold">{title}</span>
      <NotificationsBell items={notifications} unreadCount={unreadCount} />
    </header>
  )
}

const ADMIN_PREFIX = ROUTES.admin.users.slice(0, ROUTES.admin.users.lastIndexOf("/"))

const TABS = [
  { href: ROUTES.myTasks, label: "My Tasks", Icon: SquareCheckIcon, match: [ROUTES.myTasks] },
  { href: ROUTES.projects, label: "Projects", Icon: FolderIcon, match: [ROUTES.projects, ADMIN_PREFIX] },
  { href: ROUTES.notifications, label: "Alerts", Icon: BellIcon, match: [ROUTES.notifications] },
  { href: ROUTES.me, label: "Me", Icon: UserIcon, match: [ROUTES.me] },
]

/** Fixed bottom tab bar (below `lg`) with 44px+ tap targets, from the mobile design. */
export function MobileTabBar({ unreadCount }: { unreadCount: number }) {
  const pathname = usePathname()
  return (
    <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-40 grid h-17 grid-cols-4 border-t border-gray-150 bg-white pb-3 lg:hidden">
      {TABS.map(({ href, label, Icon, match }) => {
        const active = match.some((prefix) => pathname.startsWith(prefix))
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn("relative flex flex-col items-center justify-center gap-0.5 text-overline font-medium", active ? "text-cobalt-600" : "text-gray-600")}
          >
            <Icon className="size-5.5" />
            {label}
            {href === ROUTES.notifications && unreadCount > 0 && (
              <span className="absolute top-1 left-1/2 ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-danger-solid px-1 font-mono text-[10px] text-white">
                {unreadCount}
              </span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}

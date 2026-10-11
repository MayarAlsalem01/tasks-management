"use client"

import { BellIcon } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

import { useNotificationActions } from "../hooks/use-notification-actions"
import type { NotificationItem } from "../types/notification"
import { NotificationRow } from "./notification-row"
import { ROUTES } from "@/lib/routes"

/**
 * Unread / All notification list with "Mark all as read". Used inside the header popover
 * and as the full mobile Alerts page (`showViewAll` adds the "View all" link).
 */
export function NotificationsPanel({
  items,
  unreadCount,
  showViewAll = false,
  onNavigate,
}: {
  items: NotificationItem[]
  unreadCount: number
  showViewAll?: boolean
  onNavigate?: () => void
}) {
  const [filter, setFilter] = useState<"unread" | "all">(unreadCount ? "unread" : "all")
  const { open, markAll, pending } = useNotificationActions(onNavigate)
  const visible = filter === "unread" ? items.filter((n) => !n.read) : items

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2.5 border-b border-gray-75 px-3.5 py-3">
        <span className="flex-1 text-body font-semibold">Notifications</span>
        <ToggleGroup type="single" value={filter} onValueChange={(v) => v && setFilter(v as "unread" | "all")} size="sm">
          <ToggleGroupItem value="unread">Unread {unreadCount}</ToggleGroupItem>
          <ToggleGroupItem value="all">All</ToggleGroupItem>
        </ToggleGroup>
      </div>
      {visible.length === 0 ? (
        <EmptyState
          icon={<BellIcon />}
          title={filter === "unread" ? "You're all caught up" : "No notifications yet"}
          description="Assignments, QA failures and completed criteria show up here."
          className="m-3 border-0"
        />
      ) : (
        visible.map((item) => <NotificationRow key={item.id} item={item} onOpen={open} />)
      )}
      <div className="flex items-center justify-between px-3.5 py-2">
        <Button variant="ghost" size="sm" onClick={markAll} disabled={pending || unreadCount === 0}>
          Mark all as read
        </Button>
        {showViewAll && (
          <Link href={ROUTES.notifications} onClick={onNavigate} className="text-caption font-medium">
            View all
          </Link>
        )}
      </div>
    </div>
  )
}

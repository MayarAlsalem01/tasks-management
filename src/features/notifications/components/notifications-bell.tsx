"use client"

import { BellIcon } from "lucide-react"
import { useState } from "react"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

import type { NotificationItem } from "../types/notification"
import { NotificationsPanel } from "./notifications-panel"

/** Header bell with the unread badge; opens the notifications popover (FR-NOT-001). */
export function NotificationsBell({ items, unreadCount }: { items: NotificationItem[]; unreadCount: number }) {
  const [open, setOpen] = useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : "Notifications"}
        className="relative inline-flex size-11 items-center justify-center rounded-md outline-none hover:bg-gray-50 focus-visible:shadow-focus data-[state=open]:bg-gray-100 lg:size-9"
      >
        <BellIcon className="size-4.5 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-0.5 inline-flex h-4.5 min-w-4.5 items-center justify-center rounded-full border-2 border-white bg-danger-solid px-1 font-mono text-[10px] leading-none font-semibold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(400px,calc(100vw-2rem))] p-0">
        <NotificationsPanel items={items} unreadCount={unreadCount} showViewAll onNavigate={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  )
}

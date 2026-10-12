"use client"

import { cn } from "cn"
import { CheckIcon, ShieldXIcon, UserPlusIcon } from "lucide-react"

import { UserAvatar } from "@/components/ui/user-avatar"
import { relativeTime } from "@/lib/format"

import { NotificationType, type NotificationItem } from "../types/notification"

const TYPE_ICON = {
  [NotificationType.Assigned]: { Icon: UserPlusIcon, tone: "text-cobalt-500" },
  [NotificationType.QaFailed]: { Icon: ShieldXIcon, tone: "text-danger-fg" },
  [NotificationType.AcsDevComplete]: { Icon: CheckIcon, tone: "text-success-fg" },
}

/** One notification: actor avatar with a type icon, text, FR/project codes, time, unread dot. */
export function NotificationRow({
  item,
  onOpen,
  className,
}: {
  item: NotificationItem
  onOpen: (item: NotificationItem) => void
  className?: string
}) {
  const { Icon, tone } = TYPE_ICON[item.type]
  return (
    <button
      type="button"
      onClick={() => onOpen(item)}
      className={cn(
        "grid w-full grid-cols-[32px_minmax(0,1fr)_10px] items-start gap-3 border-b border-gray-75 px-3.5 py-3 text-left outline-none hover:bg-gray-25 focus-visible:bg-gray-25",
        !item.read && "bg-cobalt-50/40",
        className,
      )}
    >
      <span className="relative mt-0.5 inline-flex">
        {item.actor ? (
          <UserAvatar userId={item.actor.id} name={item.actor.fullName} size="default" />
        ) : (
          <span className="size-8 rounded-full bg-gray-100" />
        )}
        <span className={cn("absolute -right-1 -bottom-1 flex size-4.5 items-center justify-center rounded-full bg-white shadow-[0_0_0_1px_var(--color-gray-150)]", tone)}>
          <Icon className="size-2.5" />
        </span>
      </span>
      <span className="flex min-w-0 flex-col gap-1">
        <span className="text-ui text-pretty">
          {item.actor && <b className="font-semibold">{item.actor.fullName} </b>}
          {item.title}
        </span>
        {item.message && <span className="line-clamp-2 text-caption text-gray-700">{item.message}</span>}
        <span className="flex items-center gap-2 text-overline text-gray-600">
          {item.projectCode && (
            <span className="rounded-xs border border-gray-150 bg-gray-50 px-1 font-mono font-semibold text-gray-700">{item.projectCode}</span>
          )}
          {item.frCode && <span className="font-mono text-gray-700">{item.frCode}</span>}
          <span>{relativeTime(item.createdAt)}</span>
        </span>
      </span>
      <span
        aria-label={item.read ? undefined : "Unread"}
        className={cn("mt-1.5 size-2 rounded-full", item.read ? "bg-transparent" : "bg-cobalt-500")}
      />
    </button>
  )
}

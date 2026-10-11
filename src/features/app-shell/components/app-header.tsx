import { NotificationsBell, type NotificationItem } from "@/features/notifications"

import { UserMenu, type ShellUser } from "./user-menu"

/** Right side of the desktop header: notifications bell and the user menu. */
export function HeaderActions({
  user,
  notifications,
  unreadCount,
}: {
  user: ShellUser
  notifications: NotificationItem[]
  unreadCount: number
}) {
  return (
    <>
      <NotificationsBell items={notifications} unreadCount={unreadCount} />
      <span className="h-6 w-px bg-gray-150" />
      <UserMenu user={user} />
    </>
  )
}

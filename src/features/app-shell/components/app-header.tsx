import { NotificationsBell, type NotificationFeed } from "@/features/notifications"

import { UserMenu, type ShellUser } from "./user-menu"

/** Right side of the desktop header: notifications bell and the user menu. */
export function HeaderActions({
  user,
  notifications,
}: {
  user: ShellUser
  notifications: NotificationFeed
}) {
  return (
    <>
      <NotificationsBell initial={notifications} />
      <span className="h-6 w-px bg-gray-150" />
      <UserMenu user={user} />
    </>
  )
}

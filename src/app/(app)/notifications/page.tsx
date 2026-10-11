import type { Metadata } from "next"
import { Suspense } from "react"

import { NotificationsPanel } from "@/features/notifications"
import { getNotifications, getUnreadNotificationCount, NotificationsSkeleton } from "@/features/notifications/server"
import { requireUser } from "@/lib/auth/session"
import { APP_NAME } from "@/lib/config"

export const metadata: Metadata = { title: `Notifications · ${APP_NAME}` }

async function AllNotifications() {
  const user = await requireUser()
  const [items, unreadCount] = await Promise.all([getNotifications(user.id, 100), getUnreadNotificationCount(user.id)])
  return <NotificationsPanel items={items} unreadCount={unreadCount} />
}

export default function NotificationsPage() {
  return (
    <div className="mx-auto w-full max-w-2xl lg:py-6">
      <Suspense fallback={<NotificationsSkeleton />}>
        <AllNotifications />
      </Suspense>
    </div>
  )
}

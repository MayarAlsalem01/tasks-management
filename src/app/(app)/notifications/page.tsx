import type { Metadata } from "next"
import { Suspense } from "react"

import { NotificationFeedLimit, NotificationsPanel } from "@/features/notifications"
import { getNotificationFeed, NotificationsSkeleton } from "@/features/notifications/server"
import { requireUser } from "@/lib/auth/session"
import { APP_NAME } from "@/lib/config"

export const metadata: Metadata = { title: `Notifications · ${APP_NAME}` }

async function AllNotifications() {
  const user = await requireUser()
  const feed = await getNotificationFeed(user.id, NotificationFeedLimit.Page)
  return <NotificationsPanel initial={feed} limit={NotificationFeedLimit.Page} />
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

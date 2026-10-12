import { requireUser } from "@/lib/auth/session"

import { NotificationsLive } from "./notifications-live"

/** Mounts the live notification listener for the signed-in user. Must sit inside `<Suspense>`. */
export async function NotificationsLiveLoader() {
  const user = await requireUser()
  return <NotificationsLive userId={user.id} />
}

"use server"

import { actionErrorState, validationErrorState, type ActionState } from "@/lib/action-state"
import { requireUser } from "@/lib/auth/session"
import { idSchema } from "@/lib/validation"

import { revalidateNotifications } from "../cache/revalidate"
import { markAllNotificationsRead, markNotificationRead } from "./notification-queries"

/** Marks one of the signed-in user's notifications as read. */
export async function markNotificationReadAction(id: string): Promise<ActionState> {
  const parsed = idSchema.safeParse(id)
  if (!parsed.success) return validationErrorState(parsed.error)
  try {
    const user = await requireUser()
    await markNotificationRead(user.id, parsed.data)
    revalidateNotifications(user.id)
    return { status: "success" }
  } catch (error) {
    return actionErrorState(error, "notifications.markRead")
  }
}

/** Marks all of the signed-in user's notifications as read. */
export async function markAllNotificationsReadAction(): Promise<ActionState> {
  try {
    const user = await requireUser()
    await markAllNotificationsRead(user.id)
    revalidateNotifications(user.id)
    return { status: "success" }
  } catch (error) {
    return actionErrorState(error, "notifications.markAllRead")
  }
}

"use server"

import { z } from "zod"

import { actionErrorState, validationErrorState, type ActionState } from "@/lib/action-state"
import { requireUser } from "@/lib/auth/session"
import { GENERIC_ERROR_MESSAGE } from "@/lib/errors"
import { idSchema } from "@/lib/validation"

import { getNotificationFeed } from "../cache/queries"
import { revalidateNotifications } from "../cache/revalidate"
import type { NotificationFeed } from "../types/notification"
import { publishNotificationsRead } from "./notification-events"
import { markAllNotificationsRead, markNotificationRead } from "./notification-queries"

/** Marks one of the signed-in user's notifications as read and syncs their other tabs. */
export async function markNotificationReadAction(id: string): Promise<ActionState> {
  const parsed = idSchema.safeParse(id)
  if (!parsed.success) return validationErrorState(parsed.error)
  try {
    const user = await requireUser()
    await markNotificationRead(user.id, parsed.data)
    revalidateNotifications(user.id)
    publishNotificationsRead(user.id)
    return { status: "success" }
  } catch (error) {
    return actionErrorState(error, "notifications.markRead")
  }
}

/** Marks all of the signed-in user's notifications as read and syncs their other tabs. */
export async function markAllNotificationsReadAction(): Promise<ActionState> {
  try {
    const user = await requireUser()
    await markAllNotificationsRead(user.id)
    revalidateNotifications(user.id)
    publishNotificationsRead(user.id)
    return { status: "success" }
  } catch (error) {
    return actionErrorState(error, "notifications.markAllRead")
  }
}

const limitSchema = z.int().min(1).max(100)

export type NotificationFeedResult = ({ status: "success" } & NotificationFeed) | { status: "error"; message: string }

/**
 * The signed-in user's latest notifications and unread count, for the live bell (React
 * Query refetches it when a Pusher event arrives). Failures come back as values.
 */
export async function getNotificationFeedAction(limit: number): Promise<NotificationFeedResult> {
  const parsed = limitSchema.safeParse(limit)
  if (!parsed.success) return { status: "error", message: GENERIC_ERROR_MESSAGE }
  try {
    const user = await requireUser()
    return { status: "success", ...(await getNotificationFeed(user.id, parsed.data)) }
  } catch (error) {
    return { status: "error", message: actionErrorState(error, "notifications.feed").message ?? GENERIC_ERROR_MESSAGE }
  }
}

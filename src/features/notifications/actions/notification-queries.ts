import "server-only"

import { and, count, desc, eq, isNull } from "drizzle-orm"
import { alias } from "drizzle-orm/pg-core"

import { db } from "@/lib/db"
import { functionalRequirements, notifications, projects, users } from "@/lib/db/schema"

import type { NotificationItem } from "../types/notification"

const actors = alias(users, "actors")
const visibleTo = (userId: string) => and(eq(notifications.userId, userId), isNull(notifications.deletedAt))

/** The user's latest notifications (FR-NOT-001), newest first, with actor, FR and project codes. */
export async function listNotifications(userId: string, limit = 20): Promise<NotificationItem[]> {
  const rows = await db
    .select({
      id: notifications.id,
      type: notifications.type,
      title: notifications.title,
      message: notifications.message,
      linkUrl: notifications.linkUrl,
      actorId: actors.id,
      actorName: actors.fullName,
      frCode: functionalRequirements.frCode,
      projectCode: projects.code,
      createdAt: notifications.createdAt,
      readAt: notifications.readAt,
    })
    .from(notifications)
    .leftJoin(actors, eq(actors.id, notifications.actorId))
    .leftJoin(functionalRequirements, eq(functionalRequirements.id, notifications.frId))
    .leftJoin(projects, eq(projects.id, notifications.projectId))
    .where(visibleTo(userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit)

  return rows.map(({ actorId, actorName, readAt, ...n }) => ({
    ...n,
    actor: actorId && actorName ? { id: actorId, fullName: actorName } : null,
    read: readAt !== null,
  }))
}

/** Unread count for the bell badge. */
export async function countUnreadNotifications(userId: string) {
  const [row] = await db
    .select({ n: count() })
    .from(notifications)
    .where(and(visibleTo(userId), isNull(notifications.readAt)))
  return row?.n ?? 0
}

/** Marks one of the user's notifications read; other users' notifications are never touched. */
export async function markNotificationRead(userId: string, id: string) {
  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(and(visibleTo(userId), eq(notifications.id, id), isNull(notifications.readAt)))
}

export async function markAllNotificationsRead(userId: string) {
  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(and(visibleTo(userId), isNull(notifications.readAt)))
}

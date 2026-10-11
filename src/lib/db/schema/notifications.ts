import { index, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core"

import { createdAt, deletedAt } from "./columns"
import { notificationTypeEnum } from "./enums"
import { projects } from "./projects"
import { functionalRequirements } from "./requirements"
import { users } from "./users"

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: notificationTypeEnum("type").notNull(),
    title: varchar("title", { length: 150 }).notNull(),
    message: text("message").notNull(),
    linkUrl: varchar("link_url", { length: 255 }),
    projectId: uuid("project_id").references(() => projects.id),
    frId: uuid("fr_id").references(() => functionalRequirements.id),
    actorId: uuid("actor_id").references(() => users.id),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt,
    deletedAt,
  },
  (t) => [index("notifications_user_read_idx").on(t.userId, t.readAt)],
)

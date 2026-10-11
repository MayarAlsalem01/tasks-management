import { sql } from "drizzle-orm"
import {
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"

import { deletedAt, timestamps } from "./columns"
import { users } from "./users"

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    code: varchar("code", { length: 10 }).notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    description: text("description"),
    createdBy: uuid("created_by").references(() => users.id),
    // Archived projects are read-only and hidden from switchers, but restorable.
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    ...timestamps,
    deletedAt,
  },
  (t) => [uniqueIndex("projects_code_key").on(t.code).where(sql`${t.deletedAt} is null`)],
)

export const projectMembers = pgTable(
  "project_members",
  {
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    addedBy: uuid("added_by").references(() => users.id),
    addedAt: timestamp("added_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.projectId, t.userId] }),
    index("project_members_user_idx").on(t.userId),
  ],
)

export const activities = pgTable(
  "activities",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id),
    name: varchar("name", { length: 100 }).notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    createdBy: uuid("created_by").references(() => users.id),
    ...timestamps,
    deletedAt,
  },
  (t) => [index("activities_project_order_idx").on(t.projectId, t.sortOrder)],
)

export const steps = pgTable(
  "steps",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    activityId: uuid("activity_id")
      .notNull()
      .references(() => activities.id),
    name: varchar("name", { length: 100 }).notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    createdBy: uuid("created_by").references(() => users.id),
    ...timestamps,
    deletedAt,
  },
  (t) => [index("steps_activity_order_idx").on(t.activityId, t.sortOrder)],
)

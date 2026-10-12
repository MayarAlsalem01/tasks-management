import { index, jsonb, pgTable, uuid, varchar } from "drizzle-orm/pg-core"

import { createdAt } from "./columns"
import { projects } from "./projects"
import { users } from "./users"

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id").references(() => projects.id),
    entityName: varchar("entity_name", { length: 50 }).notNull(),
    entityId: uuid("entity_id").notNull(),
    userId: uuid("user_id").references(() => users.id),
    // e.g. "UPDATE", "SOFT_DELETE", "OVERRIDE_DEV_DONE"
    action: varchar("action", { length: 50 }).notNull(),
    oldValues: jsonb("old_values"),
    newValues: jsonb("new_values"),
    createdAt,
  },
  (t) => [
    index("audit_logs_entity_idx").on(t.entityName, t.entityId, t.createdAt),
    index("audit_logs_project_idx").on(t.projectId, t.createdAt),
  ],
)

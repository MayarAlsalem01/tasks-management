import {
  boolean,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"

import { timestamps } from "./columns"
import { userRoleEnum } from "./enums"

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  // Better Auth username plugin: `username` is normalized (lowercase), `displayUsername` keeps
  // the original casing. Passwords live in `accounts.password`.
  username: varchar("username", { length: 50 }).notNull().unique(),
  displayUsername: varchar("display_username", { length: 50 }),
  // Better Auth's `name` field (mapped in src/lib/auth/server.ts).
  fullName: varchar("full_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 100 }).notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  failedLoginCount: integer("failed_login_count").notNull().default(0),
  lockedUntil: timestamp("locked_until", { withTimezone: true }),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  // Set when an admin creates the account or resets the password; forces a change at next sign-in.
  mustChangePassword: boolean("must_change_password").notNull().default(false),
  ...timestamps,
  // Soft deactivation (FR-IAM-003): rows are never hard-deleted.
  deactivatedAt: timestamp("deactivated_at", { withTimezone: true }),
})

export const userRoles = pgTable(
  "user_roles",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: userRoleEnum("role").notNull(),
    grantedBy: uuid("granted_by").references(() => users.id),
    grantedAt: timestamp("granted_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.role] })],
)

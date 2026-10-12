import { sql } from "drizzle-orm"
import {
  boolean,
  date,
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
import {
  assignmentRoleEnum,
  devStatusEnum,
  priorityEnum,
  prStateEnum,
  qaStatusEnum,
  specStatusEnum,
} from "./enums"
import { projects, steps } from "./projects"
import { users } from "./users"

export const functionalRequirements = pgTable(
  "functional_requirements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // Denormalized from step → activity → project so fr_code can be unique per
    // project and dashboards / My Tasks don't need the full join.
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id),
    stepId: uuid("step_id")
      .notNull()
      .references(() => steps.id),
    frCode: varchar("fr_code", { length: 20 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description").notNull(),
    priority: priorityEnum("priority").notNull().default("medium"),
    specStatus: specStatusEnum("spec_status").notNull().default("draft"),
    isAi: boolean("is_ai").notNull().default(false),
    openIssues: text("open_issues"),
    devStatus: devStatusEnum("dev_status").notNull().default("not-started"),
    qaStatus: qaStatusEnum("qa_status").notNull().default("not-tested"),
    targetDate: date("target_date"),
    notes: text("notes"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdBy: uuid("created_by").references(() => users.id),
    updatedBy: uuid("updated_by").references(() => users.id),
    ...timestamps,
    deletedAt,
  },
  (t) => [
    uniqueIndex("fr_project_code_key")
      .on(t.projectId, t.frCode)
      .where(sql`${t.deletedAt} is null`),
    index("fr_step_idx").on(t.stepId),
    index("fr_project_dev_status_idx").on(t.projectId, t.devStatus),
  ],
)

export const frAssignees = pgTable(
  "fr_assignees",
  {
    frId: uuid("fr_id")
      .notNull()
      .references(() => functionalRequirements.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: assignmentRoleEnum("role").notNull(),
    assignedBy: uuid("assigned_by").references(() => users.id),
    assignedAt: timestamp("assigned_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.frId, t.userId, t.role] }),
    index("fr_assignees_user_idx").on(t.userId),
  ],
)

export const acceptanceCriteria = pgTable(
  "acceptance_criteria",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    frId: uuid("fr_id")
      .notNull()
      .references(() => functionalRequirements.id),
    acCode: varchar("ac_code", { length: 10 }).notNull(),
    // Always filled: composed from Given/When/Then when those are set, or imported as one
    // sentence (the Excel seed has no GWT split).
    criteriaText: text("criteria_text").notNull(),
    givenText: text("given_text"),
    whenText: text("when_text"),
    thenText: text("then_text"),
    sortOrder: integer("sort_order").notNull().default(0),
    devDone: boolean("dev_done").notNull().default(false),
    devDoneBy: uuid("dev_done_by").references(() => users.id),
    devDoneAt: timestamp("dev_done_at", { withTimezone: true }),
    qaPassed: boolean("qa_passed").notNull().default(false),
    qaPassedBy: uuid("qa_passed_by").references(() => users.id),
    qaPassedAt: timestamp("qa_passed_at", { withTimezone: true }),
    // Set when QA reports a defect on this AC (the note is a defect comment); cleared on pass.
    qaFailedAt: timestamp("qa_failed_at", { withTimezone: true }),
    ...timestamps,
    deletedAt,
  },
  (t) => [
    uniqueIndex("ac_fr_code_key")
      .on(t.frId, t.acCode)
      .where(sql`${t.deletedAt} is null`),
  ],
)

// A comment always belongs to an FR; acId is set when it's about a specific AC.
export const comments = pgTable(
  "comments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    frId: uuid("fr_id")
      .notNull()
      .references(() => functionalRequirements.id),
    acId: uuid("ac_id").references(() => acceptanceCriteria.id),
    authorId: uuid("author_id")
      .notNull()
      .references(() => users.id),
    body: text("body").notNull(),
    isDefect: boolean("is_defect").notNull().default(false),
    ...timestamps,
    deletedAt,
  },
  (t) => [
    index("comments_fr_created_idx").on(t.frId, t.createdAt),
    index("comments_ac_idx").on(t.acId),
  ],
)

export const pullRequests = pgTable(
  "pull_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    frId: uuid("fr_id")
      .notNull()
      .references(() => functionalRequirements.id),
    url: varchar("url", { length: 500 }).notNull(),
    title: varchar("title", { length: 255 }),
    state: prStateEnum("state").notNull().default("open"),
    addedBy: uuid("added_by").references(() => users.id),
    ...timestamps,
    deletedAt,
  },
  (t) => [index("pull_requests_fr_idx").on(t.frId)],
)

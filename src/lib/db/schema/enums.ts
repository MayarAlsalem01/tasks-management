import { pgEnum } from "drizzle-orm/pg-core"

export const userRoleEnum = pgEnum("user_role", ["ADMIN", "PO", "DEVELOPER", "QA"])

export const assignmentRoleEnum = pgEnum("assignment_role", ["DEVELOPER", "QA"])

export const priorityEnum = pgEnum("priority", ["critical", "high", "medium", "low"])

export const specStatusEnum = pgEnum("spec_status", ["draft", "pending-review", "approved"])

export const devStatusEnum = pgEnum("dev_status", ["not-started", "in-progress", "blocked", "done"])

export const qaStatusEnum = pgEnum("qa_status", ["not-tested", "passed", "failed"])

export const prStateEnum = pgEnum("pr_state", ["open", "merged", "draft", "closed"])

export const notificationTypeEnum = pgEnum("notification_type", [
  "ASSIGNED",
  "QA_FAILED",
  "ACS_DEV_COMPLETE",
])

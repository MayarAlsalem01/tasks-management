import { relations } from "drizzle-orm"

import { auditLogs } from "./audit"
import { accounts, sessions } from "./auth"
import { notifications } from "./notifications"
import { activities, projectMembers, projects, steps } from "./projects"
import {
  acceptanceCriteria,
  comments,
  frAssignees,
  functionalRequirements,
  pullRequests,
} from "./requirements"
import { userRoles, users } from "./users"

export const usersRelations = relations(users, ({ many }) => ({
  roles: many(userRoles),
  sessions: many(sessions),
  accounts: many(accounts),
  projectMemberships: many(projectMembers),
  assignments: many(frAssignees),
  notifications: many(notifications),
}))

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, { fields: [userRoles.userId], references: [users.id] }),
}))

export const projectsRelations = relations(projects, ({ many }) => ({
  members: many(projectMembers),
  activities: many(activities),
  requirements: many(functionalRequirements),
  auditLogs: many(auditLogs),
}))

export const projectMembersRelations = relations(projectMembers, ({ one }) => ({
  project: one(projects, { fields: [projectMembers.projectId], references: [projects.id] }),
  user: one(users, { fields: [projectMembers.userId], references: [users.id] }),
}))

export const activitiesRelations = relations(activities, ({ one, many }) => ({
  project: one(projects, { fields: [activities.projectId], references: [projects.id] }),
  steps: many(steps),
}))

export const stepsRelations = relations(steps, ({ one, many }) => ({
  activity: one(activities, { fields: [steps.activityId], references: [activities.id] }),
  requirements: many(functionalRequirements),
}))

export const functionalRequirementsRelations = relations(
  functionalRequirements,
  ({ one, many }) => ({
    project: one(projects, {
      fields: [functionalRequirements.projectId],
      references: [projects.id],
    }),
    step: one(steps, { fields: [functionalRequirements.stepId], references: [steps.id] }),
    assignees: many(frAssignees),
    acceptanceCriteria: many(acceptanceCriteria),
    comments: many(comments),
    pullRequests: many(pullRequests),
  }),
)

export const frAssigneesRelations = relations(frAssignees, ({ one }) => ({
  requirement: one(functionalRequirements, {
    fields: [frAssignees.frId],
    references: [functionalRequirements.id],
  }),
  user: one(users, { fields: [frAssignees.userId], references: [users.id] }),
}))

export const acceptanceCriteriaRelations = relations(acceptanceCriteria, ({ one, many }) => ({
  requirement: one(functionalRequirements, {
    fields: [acceptanceCriteria.frId],
    references: [functionalRequirements.id],
  }),
  comments: many(comments),
}))

export const commentsRelations = relations(comments, ({ one }) => ({
  requirement: one(functionalRequirements, {
    fields: [comments.frId],
    references: [functionalRequirements.id],
  }),
  acceptanceCriterion: one(acceptanceCriteria, {
    fields: [comments.acId],
    references: [acceptanceCriteria.id],
  }),
  author: one(users, { fields: [comments.authorId], references: [users.id] }),
}))

export const pullRequestsRelations = relations(pullRequests, ({ one }) => ({
  requirement: one(functionalRequirements, {
    fields: [pullRequests.frId],
    references: [functionalRequirements.id],
  }),
}))

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
}))

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  project: one(projects, { fields: [auditLogs.projectId], references: [projects.id] }),
  user: one(users, { fields: [auditLogs.userId], references: [users.id] }),
}))

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}))

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}))

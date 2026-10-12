import { z } from "zod"

import { Role } from "@/lib/auth/roles"
import { idSchema } from "@/lib/validation"

import { DevStatus, Priority, QaStatus, SpecStatus } from "./status"

// One schema per input, shared by client forms and Server Actions so the rules never differ.

const name = z.string().trim().min(1, "Enter a name").max(100, "Use at most 100 characters")
const optionalText = (max: number) =>
  z.string().trim().max(max, `Use at most ${max} characters`).transform((v) => v || null)
const isoDate = z.iso.date("Pick a valid date")

export const priorityValue = z.enum(Priority)
export const specValue = z.enum(SpecStatus)
export const devValue = z.enum(DevStatus)
export const qaValue = z.enum(QaStatus)

export const createActivitySchema = z.object({ projectId: idSchema, name })
export const createStepSchema = z.object({ activityId: idSchema, name })

const title = z.string().trim().min(1, "Enter the requirement").max(255, "Use at most 255 characters")
const description = z.string().trim().max(5000, "Use at most 5000 characters")

export const createFrSchema = z.object({
  stepId: z.uuid("Pick a step"),
  title,
  description: description.default(""),
  priority: priorityValue,
  spec: specValue,
  developerIds: z.array(idSchema).default([]),
  qaIds: z.array(idSchema).default([]),
  targetDate: z.union([z.literal(""), isoDate]).transform((v) => v || null).default(null),
})
export type CreateFrInput = z.infer<typeof createFrSchema>

/** Fields an Admin/PO edits in the drawer's Details tab, one at a time. */
export const frFieldsSchema = z
  .object({
    title,
    description,
    priority: priorityValue,
    spec: specValue,
    targetDate: isoDate.nullable(),
    openIssues: optionalText(2000).nullable(),
  })
  .partial()
  .refine((fields) => Object.keys(fields).length > 0, "Nothing to update")
export type FrFieldsInput = z.infer<typeof frFieldsSchema>

export const assignmentRoleValue = z.enum([Role.Developer, Role.Qa])
export type AssignmentRole = z.infer<typeof assignmentRoleValue>

export const setAssigneesSchema = z.object({ frId: idSchema, role: assignmentRoleValue, userIds: z.array(idSchema).max(20) })

/** FR-WKF-001: an Admin/PO override when ACs aren't all dev-done. */
export const overrideSchema = z.object({
  markAllAcs: z.boolean(),
  reason: optionalText(500),
})
export type OverrideInput = z.infer<typeof overrideSchema>
/** What the override dialog sends (before trimming). */
export type OverrideRequest = z.input<typeof overrideSchema>

export const setDevStatusSchema = z.object({ frId: idSchema, status: devValue, override: overrideSchema.optional() })
export const setQaStatusSchema = z.object({ frId: idSchema, status: qaValue })

const clause = (label: string) => z.string().trim().min(1, `Enter the ${label} clause`).max(1000, "Use at most 1000 characters")
export const acTextSchema = z.object({ given: clause("Given"), when: clause("When"), then: clause("Then") })
export type AcTextInput = z.infer<typeof acTextSchema>

export const toggleAcSchema = z.object({ acId: idSchema, value: z.boolean() })
export const reportDefectSchema = z.object({
  acId: idSchema,
  note: z.string().trim().min(1, "Describe the defect").max(4000, "Use at most 4000 characters"),
})
export const moveAcSchema = z.object({ acId: idSchema, direction: z.union([z.literal(-1), z.literal(1)]) })

export const notesSchema = z.object({ frId: idSchema, notes: optionalText(4000) })
export const commentSchema = z.object({
  frId: idSchema,
  body: z.string().trim().min(1, "Write a comment").max(4000, "Use at most 4000 characters"),
})

/** `https://github.com/<owner>/<repo>/pull/<n>` → repo and number. */
export const PR_URL_PATTERN = /^https?:\/\/github\.com\/[\w.-]+\/([\w.-]+)\/pull\/(\d+)\/?$/
export const pullRequestSchema = z.object({
  frId: idSchema,
  url: z.string().trim().regex(PR_URL_PATTERN, "Paste a GitHub pull request URL, like github.com/org/repo/pull/123"),
})

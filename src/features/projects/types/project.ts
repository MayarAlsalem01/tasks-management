import { z } from "zod"

export const projectFormSchema = z.object({
  name: z.string().trim().min(1, "Enter a project name").max(100, "Use at most 100 characters"),
  description: z.string().trim().max(1000, "Use at most 1000 characters").optional().default(""),
  memberIds: z.array(z.uuid()).default([]),
})

export const createProjectSchema = projectFormSchema.extend({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z][A-Z0-9]{1,4}$/, "Use 2–5 letters or digits, starting with a letter"),
})

export type ProjectFormInput = z.infer<typeof projectFormSchema>
export type CreateProjectInput = z.infer<typeof createProjectSchema>

/** A project as shown in switchers and the mobile Projects list. */
export type ProjectSummary = {
  id: string
  code: string
  name: string
  /** Open FRs (not Done) assigned to the current user in this project. */
  mineCount: number
}

export type ProjectMember = { id: string; fullName: string; deactivated: boolean }

/** A row of the admin Projects table. */
export type AdminProjectRow = {
  id: string
  code: string
  name: string
  description: string | null
  archived: boolean
  memberIds: string[]
  /** Members plus admins, for the count and avatar stack (admins can access every project). */
  team: ProjectMember[]
  frCount: number
  devDonePct: number
  qaPassedPct: number
}

export type MemberOption = { id: string; fullName: string; rolesLabel: string }

export type ProjectNavStep = { id: string; name: string; frCount: number }
export type ProjectNavActivity = { id: string; name: string; frCount: number; steps: ProjectNavStep[] }
export type ProjectNav = {
  id: string
  code: string
  name: string
  frCount: number
  activities: ProjectNavActivity[]
}

import { z } from "zod"

import { passwordSchema, usernameSchema } from "@/lib/auth/credentials"
import { ROLES, type Role } from "@/lib/auth/roles"

const userFields = z.object({
  fullName: z.string().trim().min(1, "Enter the person's full name").max(100, "Use at most 100 characters"),
  email: z.email("Enter a valid email address").trim().toLowerCase().max(100, "Use at most 100 characters"),
  roles: z.array(z.enum(ROLES as [Role, ...Role[]])).min(1, "Choose at least one role"),
  projectIds: z.array(z.uuid()).default([]),
})

// Projects are optional: users can be created first and added to projects later.
export const updateUserSchema = userFields

export const createUserSchema = userFields.extend({ username: usernameSchema, password: passwordSchema })

export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type CreateUserInput = z.infer<typeof createUserSchema>

export type UserStatusFilter = "active" | "deactivated"

export type UserFilters = {
  q?: string
  role?: Role
  /** Project code. */
  project?: string
  status?: UserStatusFilter
}

/** A row of the admin Users table; also feeds the Edit user dialog. */
export type AdminUserRow = {
  id: string
  username: string
  fullName: string
  email: string
  roles: Role[]
  projects: { id: string; code: string }[]
  deactivated: boolean
  lastLoginAt: Date | null
  passwordChangedAt: Date | null
}

export type ProjectOption = { id: string; code: string; name: string }

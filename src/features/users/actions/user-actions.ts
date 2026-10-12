"use server"

import { z } from "zod"

import { actionErrorState, validationErrorState, type ActionState } from "@/lib/action-state"
import { requireAdmin } from "@/lib/auth/session"
import { idSchema } from "@/lib/validation"

import { revalidateUsers } from "../cache/revalidate"
import { createUserSchema, updateUserSchema } from "../types/user"
import { createUser, resetUserPassword, setUserDeactivated, updateUser } from "./user-mutations"

function readUserForm(formData: FormData) {
  return {
    username: formData.get("username"),
    password: formData.get("password"),
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    roles: formData.getAll("roles"),
    projectIds: formData.getAll("projectIds"),
  }
}

/** Admin Server Action: provision a new account from the New user dialog (FR-IAM-001). */
export async function createUserAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = createUserSchema.safeParse(readUserForm(formData))
  if (!parsed.success) return validationErrorState(parsed.error)
  try {
    const actor = await requireAdmin()
    await createUser(parsed.data, actor.id)
    revalidateUsers()
    return { status: "success", message: `${parsed.data.fullName} created` }
  } catch (error) {
    return actionErrorState(error, "users.create")
  }
}

/** Admin Server Action: save the Edit user dialog. */
export async function updateUserAction(userId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const id = idSchema.safeParse(userId)
  const parsed = updateUserSchema.safeParse(readUserForm(formData))
  if (!id.success) return validationErrorState(id.error)
  if (!parsed.success) return validationErrorState(parsed.error)
  try {
    const actor = await requireAdmin()
    await updateUser(id.data, parsed.data, actor.id)
    revalidateUsers()
    return { status: "success", message: `Saved changes to ${parsed.data.fullName}` }
  } catch (error) {
    return actionErrorState(error, "users.update")
  }
}

const deactivateArgsSchema = z.tuple([idSchema, z.boolean()])

/** Admin Server Action: deactivate (`true`) or reactivate (`false`) an account. */
export async function setUserDeactivatedAction(userId: string, deactivated: boolean): Promise<ActionState> {
  const args = deactivateArgsSchema.safeParse([userId, deactivated])
  if (!args.success) return validationErrorState(args.error)
  try {
    const actor = await requireAdmin()
    await setUserDeactivated(...args.data, actor.id)
    revalidateUsers()
    return { status: "success" }
  } catch (error) {
    return actionErrorState(error, deactivated ? "users.deactivate" : "users.reactivate")
  }
}

/**
 * Admin Server Action: reset a user's password. On success `message` carries the new
 * temporary password, shown once in the dialog for the admin to share.
 */
export async function resetUserPasswordAction(userId: string): Promise<ActionState> {
  const id = idSchema.safeParse(userId)
  if (!id.success) return validationErrorState(id.error)
  try {
    const actor = await requireAdmin()
    const password = await resetUserPassword(id.data, actor.id)
    revalidateUsers()
    return { status: "success", message: password }
  } catch (error) {
    return actionErrorState(error, "users.resetPassword")
  }
}

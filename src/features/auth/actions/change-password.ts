"use server"

import { redirect, unstable_rethrow } from "next/navigation"

import { validationErrorState, type ActionState } from "@/lib/action-state"
import { getVerifiedUserId } from "@/lib/auth/session"
import { logError, toUserMessage } from "@/lib/errors"
import { ROUTES } from "@/lib/routes"

import { revalidateUserAccess } from "../cache/revalidate"
import { changePasswordSchema } from "../types/change-password"
import { changeOwnPassword } from "./change-password-service"

/**
 * Server Action for `/change-password`: validates the new password and its confirmation,
 * saves it for the signed-in user, then sends them into the app. Used for the forced change
 * after an admin creates the account or resets the password, and for voluntary changes.
 */
export async function changePassword(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = changePasswordSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return validationErrorState(parsed.error)

  // Verified against the DB so a session revoked by a password reset can't set a new one.
  const userId = await getVerifiedUserId()
  if (!userId) redirect(ROUTES.login)

  try {
    await changeOwnPassword(userId, parsed.data.password)
  } catch (error) {
    unstable_rethrow(error)
    logError(error, "auth.changePassword", { userId })
    return { status: "error", message: toUserMessage(error) }
  }
  revalidateUserAccess()
  redirect(ROUTES.home)
}

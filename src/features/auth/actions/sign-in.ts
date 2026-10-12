"use server"

import { redirect, unstable_rethrow } from "next/navigation"

import { GENERIC_ERROR_MESSAGE, logError } from "@/lib/errors"
import { ROUTES } from "@/lib/routes"

import { revalidateUserAccess } from "../cache/revalidate"
import { signInSchema, type SignInState } from "../types/sign-in"
import { signInWithUsername } from "./sign-in-service"

/**
 * Server Action behind the sign-in form (used with `useActionState`).
 * Validates the form, runs the sign-in service, and on success redirects to `/`, or to
 * `/change-password` when an admin-issued password must be replaced first.
 * Expected failures (wrong credentials, locked, deactivated) come back as `SignInState`;
 * unexpected ones are logged and returned as a generic error.
 */
export async function signIn(_prev: SignInState, formData: FormData): Promise<SignInState> {
  const parsed = signInSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0].message }
  }

  let result
  try {
    result = await signInWithUsername(parsed.data)
  } catch (error) {
    unstable_rethrow(error)
    logError(error, "auth.signIn")
    return { status: "error", message: GENERIC_ERROR_MESSAGE }
  }

  if (result.status === "success") {
    revalidateUserAccess()
    // Go straight to the forced change instead of letting `/my-tasks` bounce there: the client
    // router would keep that redirecting `/my-tasks` payload and replay it after the password
    // is saved, sending the user back to `/change-password` a second time.
    redirect(result.mustChangePassword ? ROUTES.changePassword : ROUTES.home)
  }
  return result
}

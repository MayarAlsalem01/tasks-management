"use server"

import { redirect, unstable_rethrow } from "next/navigation"

import { GENERIC_ERROR_MESSAGE, logError } from "@/lib/errors"
import { ROUTES } from "@/lib/routes"

import { revalidateUserAccess } from "../cache/revalidate"
import { signInSchema, type SignInState } from "../types/sign-in"
import { signInWithUsername } from "./sign-in-service"

/**
 * Server Action behind the sign-in form (used with `useActionState`).
 * Validates the form, runs the sign-in service, and redirects to `/` on success.
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
    redirect(ROUTES.home)
  }
  return result
}

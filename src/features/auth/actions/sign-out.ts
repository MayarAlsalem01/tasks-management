"use server"

import { headers } from "next/headers"
import { redirect, unstable_rethrow } from "next/navigation"

import { auth } from "@/lib/auth/server"
import { logError } from "@/lib/errors"
import { ROUTES } from "@/lib/routes"

/**
 * Server Action that ends the current session (deletes it and clears the auth cookies)
 * and sends the user to `/login`. If revoking fails the error is logged and the user is
 * still redirected, so a broken session never traps them on a page.
 */
export async function signOut() {
  try {
    await auth.api.signOut({ headers: await headers() })
  } catch (error) {
    unstable_rethrow(error)
    logError(error, "auth.signOut")
  }
  redirect(ROUTES.login)
}

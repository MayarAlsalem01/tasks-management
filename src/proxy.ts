import { getSessionCookie } from "better-auth/cookies"
import { NextResponse, type NextRequest } from "next/server"
import { ROUTES } from "@/lib/routes"

/**
 * Sends visitors without a session cookie to `/login`. This is an optimistic check only:
 * the cookie isn't validated here, so pages and actions must still call `requireUser()`.
 * `/login` is never redirected back to `/`, because a stale cookie would cause a loop.
 */
export function proxy(request: NextRequest) {
  if (!getSessionCookie(request)) {
    return NextResponse.redirect(new URL(ROUTES.login, request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!login|api/auth|api/pusher|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
}

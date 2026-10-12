import { z } from "zod"

import { getCurrentUser } from "@/lib/auth/session"
import { authorizeUserChannel } from "@/lib/pusher/server"

const authRequestSchema = z.object({
  socket_id: z.string().min(1),
  channel_name: z.string().min(1),
})

/** Pusher private-channel auth: a signed-in user may subscribe only to their own channel. */
export async function POST(request: Request) {
  // A missing or non-form body is a bad request, not a server error.
  const form = await request.formData().catch(() => null)
  const parsed = authRequestSchema.safeParse(form ? Object.fromEntries(form) : {})
  if (!parsed.success) return new Response("Bad request", { status: 400 })

  const user = await getCurrentUser()
  if (!user || user.mustChangePassword) return new Response("Unauthorized", { status: 401 })

  const auth = authorizeUserChannel(user.id, parsed.data.socket_id, parsed.data.channel_name)
  if (!auth) return new Response("Forbidden", { status: 403 })
  return Response.json(auth)
}

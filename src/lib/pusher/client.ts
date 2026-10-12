import PusherClient from "pusher-js"

import { ROUTES } from "@/lib/routes"

let client: PusherClient | undefined

/**
 * The browser's single Pusher connection, created on first use so server renders never open
 * a socket. Private channels are authorized by `ROUTES.api.pusherAuth` with the session cookie.
 */
export function getPusherClient() {
  client ??= new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    channelAuthorization: { endpoint: ROUTES.api.pusherAuth, transport: "ajax" },
  })
  return client
}

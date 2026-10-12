import "server-only"

import { after } from "next/server"
import Pusher from "pusher"
import { z } from "zod"

import { logError } from "@/lib/errors"

import { userChannel, type PusherEvent } from "./channels"

const envSchema = z.object({
  PUSHER_APP_ID: z.string().min(1),
  PUSHER_SECRET: z.string().min(1),
  NEXT_PUBLIC_PUSHER_KEY: z.string().min(1),
  NEXT_PUBLIC_PUSHER_CLUSTER: z.string().min(1),
})

// Pusher accepts at most 100 channels per trigger.
const MAX_CHANNELS_PER_TRIGGER = 100

let client: Pusher | undefined

function getPusher() {
  if (!client) {
    const env = envSchema.parse(process.env)
    client = new Pusher({
      appId: env.PUSHER_APP_ID,
      key: env.NEXT_PUBLIC_PUSHER_KEY,
      secret: env.PUSHER_SECRET,
      cluster: env.NEXT_PUBLIC_PUSHER_CLUSTER,
      useTLS: true,
    })
  }
  return client
}

/**
 * Broadcasts `event` to `channels` after the response is sent (`after()`), so callers never
 * wait on Pusher. Call it only once the change it announces has committed. Failures are
 * logged, never thrown: a missed live update must not fail a write that already succeeded.
 */
export function publish(channels: readonly string[], event: PusherEvent, data: object = {}) {
  if (!channels.length) return
  after(async () => {
    try {
      const pusher = getPusher()
      for (let i = 0; i < channels.length; i += MAX_CHANNELS_PER_TRIGGER) {
        await pusher.trigger(channels.slice(i, i + MAX_CHANNELS_PER_TRIGGER), event, data)
      }
    } catch (error) {
      logError(error, "pusher.publish", { event, channels: channels.length })
    }
  })
}

/**
 * Signs a browser's subscription to a private channel. Users may only join their own
 * `userChannel`; any other channel returns `null` so the route can answer 403.
 */
export function authorizeUserChannel(userId: string, socketId: string, channelName: string) {
  if (channelName !== userChannel(userId)) return null
  return getPusher().authorizeChannel(socketId, channelName)
}

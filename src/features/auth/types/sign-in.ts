import { z } from "zod"

export const signInSchema = z.object({
  username: z.string().trim().min(1, "Enter your username."),
  password: z.string().min(1, "Enter your password."),
})

export type SignInInput = z.infer<typeof signInSchema>

export type SignInState =
  | { status: "idle" }
  | { status: "invalid"; attemptsLeft: number }
  | { status: "locked"; retryAfterSeconds: number }
  | { status: "deactivated" }
  | { status: "error"; message: string }

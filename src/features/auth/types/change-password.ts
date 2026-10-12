import { z } from "zod"

import { passwordSchema } from "@/lib/auth/credentials"

export const changePasswordSchema = z
  .object({ password: passwordSchema, confirm: z.string() })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "Passwords don't match" })

import { z } from "zod"

/** Every entity id is a UUID. Validate ids that arrive as Server Action arguments with it. */
export const idSchema = z.uuid("Unknown record.")

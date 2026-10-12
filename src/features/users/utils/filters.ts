import { z } from "zod"

import { ROLES, type Role } from "@/lib/auth/roles"

import type { UserFilters } from "../types/user"

type SearchParams = Record<string, string | string[] | undefined>

const single = z.preprocess((v) => (Array.isArray(v) ? v[0] : v), z.string().trim().optional())

/** Users-table filters from the URL. Unknown or malformed values are dropped, never an error. */
const userFiltersSchema = z.object({
  q: single.transform((v) => v || undefined),
  role: single.pipe(z.enum(ROLES as [Role, ...Role[]]).optional()).catch(undefined),
  project: single.transform((v) => v?.toUpperCase() || undefined),
  status: single.pipe(z.enum(["active", "deactivated"]).optional()).catch(undefined),
})

export function parseUserFilters(params: SearchParams): UserFilters {
  return userFiltersSchema.parse(params)
}

/** Names of unique constraints/indexes the app maps to friendly field errors. */
export const UniqueConstraint = {
  Username: "users_username_unique",
  Email: "users_email_unique",
  ProjectCode: "projects_code_key",
  FrCode: "fr_project_code_key",
  AcCode: "ac_fr_code_key",
} as const

/**
 * True when `error` (or the driver error it wraps) is a Postgres unique-constraint violation,
 * optionally on a specific constraint/index name. Drizzle wraps driver errors in `cause`.
 */
export function isUniqueViolation(error: unknown, constraint?: string): boolean {
  for (let e: unknown = error; e && typeof e === "object"; e = (e as { cause?: unknown }).cause) {
    const pg = e as { code?: string; constraint?: string }
    if (pg.code === "23505") return !constraint || pg.constraint === constraint
  }
  return false
}

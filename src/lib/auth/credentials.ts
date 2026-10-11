import { z } from "zod"

// Shared by the admin user forms, the change-password screen and the Better Auth config.
// Kept free of server-only imports so client forms can use the same rules.

/** Better Auth provider id for username/password accounts (`accounts.provider_id`). */
export const CREDENTIAL_PROVIDER = "credential"

export const USERNAME_PATTERN = /^[a-z0-9._-]{3,50}$/

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(USERNAME_PATTERN, "Use 3–50 lowercase letters, numbers, dots, dashes or underscores")

export const MIN_PASSWORD_LENGTH = 10

export const passwordSchema = z
  .string()
  .min(MIN_PASSWORD_LENGTH, `Use at least ${MIN_PASSWORD_LENGTH} characters`)
  .max(128, "Use at most 128 characters")

/**
 * Rough password strength from 0 (empty) to 4 (strong), for the strength meter only.
 * It is guidance, not a rule: `passwordSchema` is what actually gets enforced.
 */
export function passwordStrength(password: string): 0 | 1 | 2 | 3 | 4 {
  if (!password) return 0
  let score = 0
  if (password.length >= MIN_PASSWORD_LENGTH) score++
  if (password.length >= 14) score++
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++
  if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score++
  return Math.max(1, score) as 1 | 2 | 3 | 4
}

export const PASSWORD_STRENGTH_LABELS = ["Enter a password", "Weak", "Fair", "Good", "Strong"] as const

const PASSWORD_ALPHABET = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789!#$%"

/** A random 16-character password without look-alike characters, from the Web Crypto RNG. */
export function generatePassword(length = 16) {
  const bytes = crypto.getRandomValues(new Uint32Array(length))
  return Array.from(bytes, (n) => PASSWORD_ALPHABET[n % PASSWORD_ALPHABET.length]).join("")
}

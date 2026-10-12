const AVATAR_TINTS = [
  "bg-[#F9DCEB] text-[#8A1F57]",
  "bg-[#D3F0E4] text-[#1B5E43]",
  "bg-[#E4DCFB] text-[#4A2E9E]",
  "bg-[#FCE3D2] text-[#8A3B12]",
  "bg-[#D6E6FB] text-[#1D4F91]",
] as const

/** Stable muted tint classes for a user, derived from their id. */
export function avatarTint(userId: string): string {
  let hash = 0
  for (const char of userId) {
    hash = (Math.imul(hash, 31) + char.charCodeAt(0)) >>> 0
  }
  return AVATAR_TINTS[hash % AVATAR_TINTS.length]
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("")
}

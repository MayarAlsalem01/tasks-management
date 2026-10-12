const PROJECT_COLORS = ["#213895", "#1B5E43", "#8A3B12", "#4A2E9E", "#8A1F57", "#1D4F91"] as const

/** Stable badge colour for a project, derived from its key (there's no colour column). */
export function projectColor(code: string, archived = false) {
  if (archived) return "#5B6170"
  let hash = 0
  for (const char of code) hash = (Math.imul(hash, 31) + char.charCodeAt(0)) >>> 0
  return PROJECT_COLORS[hash % PROJECT_COLORS.length]
}

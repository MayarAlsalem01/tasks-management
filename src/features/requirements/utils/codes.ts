/** `FR-PAY-007`: project key plus a 3-digit (or longer) sequence. */
export function formatFrCode(projectCode: string, sequence: number) {
  return `FR-${projectCode}-${String(sequence).padStart(3, "0")}`
}

/** `AC1`, `AC2`… (the FRS / Excel seed format). */
export function formatAcCode(sequence: number) {
  return `AC${sequence}`
}

/**
 * Next sequence after the highest trailing number in `codes` (deleted codes included, so a
 * code is never reused). Codes without a trailing number are ignored.
 */
export function nextSequence(codes: readonly string[]) {
  const numbers = codes.map((code) => Number(/(\d+)$/.exec(code)?.[1] ?? 0))
  return Math.max(0, ...numbers) + 1
}

/** One-sentence form of a Given/When/Then AC, stored in `criteria_text`. */
export function composeCriteria({ given, when, then }: { given: string; when: string; then: string }) {
  return `Given ${given}, when ${when}, then ${then}.`
}

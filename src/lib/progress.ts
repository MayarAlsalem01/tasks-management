/** Whole-number percentage of `part` in `total`; 0 when there's nothing to count. */
export function percent(part: number, total: number) {
  return total === 0 ? 0 : Math.round((part / total) * 100)
}

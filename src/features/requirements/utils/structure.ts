import type { StructureNode } from "../types/structure"

const count = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`

/** What else a delete takes with it, e.g. "This also deletes its 2 steps and 5 requirements." */
export function deletionSummary(node: StructureNode): string {
  const parts = [node.stepCount ? count(node.stepCount, "step") : null, node.frCount ? count(node.frCount, "requirement") : null].filter(Boolean)
  return parts.length ? `This also deletes its ${parts.join(" and ")}.` : "It's empty, so nothing else is affected."
}

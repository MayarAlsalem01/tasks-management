/** The two levels of a project's journey structure (FR-PRJ-002) that Admins/POs edit. */
export const StructureKind = { Activity: "activity", Step: "step" } as const
export type StructureKind = (typeof StructureKind)[keyof typeof StructureKind]

/** An activity or step as the rename/delete dialogs need it. */
export type StructureNode = {
  kind: StructureKind
  id: string
  name: string
  /** Live FRs under it. */
  frCount: number
  /** Live steps under it (activities only). */
  stepCount?: number
}

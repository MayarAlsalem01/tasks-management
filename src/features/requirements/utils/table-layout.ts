import { FrColumn } from "../types/table"

const COLUMN_WIDTH: Record<FrColumn, string> = {
  priority: "84px",
  spec: "124px",
  assignee: "132px",
  dev: "124px",
  qa: "112px",
  acs: "130px",
  target: "84px",
  notes: "40px",
}

/** Display order of the optional columns. */
export const FR_COLUMNS = Object.values(FrColumn)

/** CSS grid template for the project table (ID and Requirement are always shown). */
export function frGridTemplate(visible: readonly FrColumn[]) {
  return ["92px", "minmax(190px,1fr)", ...FR_COLUMNS.filter((c) => visible.includes(c)).map((c) => COLUMN_WIDTH[c])].join(" ")
}

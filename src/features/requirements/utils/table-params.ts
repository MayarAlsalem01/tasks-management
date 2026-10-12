import { z } from "zod"

import { NewItem, SearchParam } from "@/lib/routes"

import {
  DEV_STATUS_LABEL,
  DevStatus,
  Priority,
  PRIORITY_LABEL,
  QA_STATUS_LABEL,
  QaStatus,
  SPEC_STATUS_LABEL,
  SpecStatus,
} from "../types/status"
import { BoardLanes, DrawerTab, FrGroupBy, UNASSIGNED } from "../types/table"

type Params = Record<string, string | string[] | undefined>

const single = z.preprocess((v) => (Array.isArray(v) ? v[0] : v), z.string().trim().optional())
const text = single.transform((v) => v || undefined)
const oneOf = <T extends Record<string, string>>(values: T) => single.pipe(z.enum(values).optional()).catch(undefined)

/** Project-view state (table and board) from the URL. Unknown or malformed values are dropped, never an error. */
const tableParamsSchema = z.object({
  [SearchParam.Query]: text,
  [SearchParam.Assignee]: text,
  [SearchParam.Priority]: oneOf(Priority),
  [SearchParam.Dev]: oneOf(DevStatus),
  [SearchParam.Qa]: oneOf(QaStatus),
  [SearchParam.Spec]: oneOf(SpecStatus),
  [SearchParam.Step]: text,
  [SearchParam.Group]: oneOf(FrGroupBy).transform((v) => v ?? FrGroupBy.Activity),
  [SearchParam.Lanes]: oneOf(BoardLanes).transform((v) => v ?? BoardLanes.Activity),
  [SearchParam.Archived]: single.transform((v) => v === "1"),
  [SearchParam.Fr]: text,
  [SearchParam.Panel]: oneOf(DrawerTab).transform((v) => v ?? DrawerTab.Details),
  [SearchParam.New]: oneOf(NewItem),
  [SearchParam.Parent]: text,
})

export type TableParams = z.output<typeof tableParamsSchema>

export function parseTableParams(params: Params | URLSearchParams): TableParams {
  const record = params instanceof URLSearchParams ? Object.fromEntries(params) : params
  return tableParamsSchema.parse(record)
}

/** The filter keys "Clear filters" resets (grouping, archived and the drawer stay). */
export const FILTER_KEYS = [
  SearchParam.Query,
  SearchParam.Assignee,
  SearchParam.Priority,
  SearchParam.Dev,
  SearchParam.Qa,
  SearchParam.Spec,
] as const

export function hasActiveFilters(params: TableParams) {
  return FILTER_KEYS.some((key) => Boolean(params[key]))
}

/** "“refund” · Priority: High · Dev: Blocked" for the no-results message. */
export function describeFilters(params: TableParams, personName: (id: string) => string | undefined) {
  return [
    params.q && `“${params.q}”`,
    params.assignee && `Assignee: ${params.assignee === UNASSIGNED ? "Unassigned" : (personName(params.assignee) ?? "Unknown")}`,
    params.priority && `Priority: ${PRIORITY_LABEL[params.priority]}`,
    params.dev && `Dev: ${DEV_STATUS_LABEL[params.dev]}`,
    params.qa && `QA: ${QA_STATUS_LABEL[params.qa]}`,
    params.spec && `Spec: ${SPEC_STATUS_LABEL[params.spec]}`,
  ]
    .filter(Boolean)
    .join(" · ")
}

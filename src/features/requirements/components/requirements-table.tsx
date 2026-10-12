"use client"

import { useState } from "react"

import type { FrRow as FrRowData } from "../types/requirement"
import { COLUMN_HEADER, type FrColumn, type FrGroupBy } from "../types/table"
import { todayIso } from "../utils/dates"
import { frGridTemplate } from "../utils/table-layout"
import { buildTableItems } from "../utils/table-rows"
import { FrGroupRow } from "./fr-group-row"
import { FrRow } from "./fr-row"

/**
 * The grouped requirements grid (FR-UI-001): sticky header, collapsible groups with rollups,
 * and FR rows. Scrolls horizontally on narrow screens instead of squeezing columns.
 */
export function RequirementsTable({ rows, groupBy, columns, selectedCode }: { rows: FrRowData[]; groupBy: FrGroupBy; columns: FrColumn[]; selectedCode?: string }) {
  const [collapsed, setCollapsed] = useState<ReadonlySet<string>>(new Set())
  const toggle = (key: string) =>
    setCollapsed((keys) => {
      const next = new Set(keys)
      if (!next.delete(key)) next.add(key)
      return next
    })
  const grid = frGridTemplate(columns)
  const today = todayIso()

  return (
    <div className="min-w-max">
      <div
        style={{ gridTemplateColumns: grid }}
        className="sticky top-0 z-[5] grid h-[34px] items-center gap-2.5 border-b border-gray-150 bg-gray-25 px-4 text-caption font-medium text-gray-600"
      >
        <span>ID</span>
        <span>Requirement</span>
        {columns.map((column) => <span key={column}>{COLUMN_HEADER[column]}</span>)}
      </div>
      {buildTableItems(rows, groupBy, collapsed).map((item) =>
        item.kind === "group" ? (
          <FrGroupRow key={item.key} label={item.label} level={item.level} stats={item.stats} collapsed={item.collapsed} onToggle={() => toggle(item.key)} />
        ) : (
          <FrRow key={item.row.id} fr={item.row} columns={columns} grid={grid} selected={item.row.code === selectedCode} today={today} />
        ),
      )}
    </div>
  )
}

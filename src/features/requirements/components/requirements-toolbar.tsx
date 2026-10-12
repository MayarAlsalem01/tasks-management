"use client"

import { cn } from "cn"
import { Columns2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { FilterSelect } from "@/components/ui/filter-select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { SearchParam } from "@/lib/routes"

import type { ProjectPerson } from "../types/requirement"
import { COLUMN_LABEL, FrGroupBy, GROUP_BY_LABEL, type FrColumn } from "../types/table"
import { FR_COLUMNS } from "../utils/table-layout"
import type { TableParams } from "../utils/table-params"
import { RequirementFilters } from "./requirement-filters"

function ColumnsMenu({ visible, onToggle }: { visible: FrColumn[]; onToggle: (column: FrColumn) => void }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline"><Columns2Icon />Columns</Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-52 p-1">
        {FR_COLUMNS.map((column) => (
          <label key={column} className="flex h-[30px] cursor-pointer items-center gap-2.5 rounded-md px-2 text-ui hover:bg-gray-50">
            <Checkbox checked={visible.includes(column)} onCheckedChange={() => onToggle(column)} />
            {COLUMN_LABEL[column]}
          </label>
        ))}
      </PopoverContent>
    </Popover>
  )
}

type ToolbarProps = {
  params: TableParams
  people: ProjectPerson[]
  columns: FrColumn[]
  onToggleColumn: (column: FrColumn) => void
  update: (changes: Record<string, string | undefined>) => void
  onClear: () => void
}

/** Filters, grouping, column visibility and the archived toggle for the project table. */
export function RequirementsToolbar({ params, people, columns, onToggleColumn, update, onClear }: ToolbarProps) {
  return (
    <div className="flex flex-none flex-wrap items-center gap-2 border-b border-gray-150 px-4 py-3 lg:px-6">
      <RequirementFilters params={params} people={people} update={update} onClear={onClear} />
      <span className="flex-1" />
      <FilterSelect label="Group" value={params.group} onChange={(v) => update({ [SearchParam.Group]: v === FrGroupBy.Activity ? undefined : v })} options={Object.entries(GROUP_BY_LABEL).map(([value, label]) => ({ value, label }))} />
      <ColumnsMenu visible={columns} onToggle={onToggleColumn} />
      <button
        type="button"
        role="switch"
        aria-checked={params.archived}
        onClick={() => update({ [SearchParam.Archived]: params.archived ? undefined : "1" })}
        className="inline-flex h-8 items-center gap-2 rounded-md border border-input bg-white px-2.5 text-ui font-medium outline-none hover:bg-gray-50 focus-visible:shadow-focus"
      >
        <span className={cn("relative inline-block h-4 w-7 rounded-full transition-colors", params.archived ? "bg-primary" : "bg-gray-300")}>
          <span className={cn("absolute top-0.5 size-3 rounded-full bg-white transition-[left]", params.archived ? "left-3.5" : "left-0.5")} />
        </span>
        Show archived
      </button>
    </div>
  )
}

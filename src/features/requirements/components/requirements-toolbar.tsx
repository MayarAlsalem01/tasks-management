"use client"

import { cn } from "cn"
import { Columns2Icon, SearchIcon } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { FILTER_ALL, FilterSelect } from "@/components/ui/filter-select"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Role } from "@/lib/auth/roles"
import { SearchParam } from "@/lib/routes"

import type { ProjectPerson } from "../types/requirement"
import { DEV_STATUS_LABEL, PRIORITY_LABEL, QA_STATUS_LABEL, SPEC_STATUS_LABEL } from "../types/status"
import { COLUMN_LABEL, FrGroupBy, GROUP_BY_LABEL, UNASSIGNED, type FrColumn } from "../types/table"
import { FR_COLUMNS } from "../utils/table-layout"
import { hasActiveFilters, type TableParams } from "../utils/table-params"

const optionsFrom = (allLabel: string, labels: Record<string, string>) => [
  { value: FILTER_ALL, label: allLabel },
  ...Object.entries(labels).map(([value, label]) => ({ value, label })),
]

/** Search box that writes to the URL as you type and empties itself when filters are cleared. */
function SearchBox({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [text, setText] = useState(value)
  const [synced, setSynced] = useState(value)
  if (value !== synced) {
    setSynced(value)
    if (!value) setText("")
  }
  return (
    <InputGroup className="h-8 w-full bg-white sm:w-50">
      <InputGroupAddon><SearchIcon /></InputGroupAddon>
      <InputGroupInput
        type="search"
        aria-label="Search requirements"
        placeholder="Search ID or text"
        value={text}
        onChange={(e) => {
          setText(e.target.value)
          onChange(e.target.value.trim())
        }}
      />
    </InputGroup>
  )
}

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
  const set = (key: string) => (value: string | undefined) => update({ [key]: value })
  const developers = people.filter((p) => p.roles.includes(Role.Developer))
  return (
    <div className="flex flex-none flex-wrap items-center gap-2 border-b border-gray-150 px-4 py-3 lg:px-6">
      <SearchBox value={params.q ?? ""} onChange={(v) => update({ [SearchParam.Query]: v })} />
      <FilterSelect hideLabel label="Assignee" value={params.assignee} onChange={set(SearchParam.Assignee)}
        options={[{ value: FILTER_ALL, label: "Assignee" }, { value: UNASSIGNED, label: "Unassigned" }, ...developers.map((p) => ({ value: p.id, label: p.fullName }))]} />
      <FilterSelect hideLabel label="Priority" value={params.priority} onChange={set(SearchParam.Priority)} options={optionsFrom("Priority", PRIORITY_LABEL)} className="min-w-0" />
      <FilterSelect hideLabel label="Dev status" value={params.dev} onChange={set(SearchParam.Dev)} options={optionsFrom("Dev status", DEV_STATUS_LABEL)} className="min-w-0" />
      <FilterSelect hideLabel label="QA status" value={params.qa} onChange={set(SearchParam.Qa)} options={optionsFrom("QA status", QA_STATUS_LABEL)} className="min-w-0" />
      <FilterSelect hideLabel label="Spec status" value={params.spec} onChange={set(SearchParam.Spec)} options={optionsFrom("Spec status", SPEC_STATUS_LABEL)} className="min-w-0" />
      {hasActiveFilters(params) && <Button variant="link" className="px-2!" onClick={onClear}>Clear</Button>}
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

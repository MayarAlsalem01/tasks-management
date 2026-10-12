"use client"

import { SearchIcon } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { FILTER_ALL, FilterSelect } from "@/components/ui/filter-select"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Role } from "@/lib/auth/roles"
import { SearchParam } from "@/lib/routes"

import type { ProjectPerson } from "../types/requirement"
import { DEV_STATUS_LABEL, PRIORITY_LABEL, QA_STATUS_LABEL, SPEC_STATUS_LABEL } from "../types/status"
import { UNASSIGNED } from "../types/table"
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

type RequirementFiltersProps = {
  params: TableParams
  people: ProjectPerson[]
  update: (changes: Record<string, string | undefined>) => void
  onClear: () => void
  /** The board hides the Dev status filter: its columns already split by dev status. */
  showDev?: boolean
}

/** Search plus the assignee, priority, dev, QA and spec filters shared by the project views. */
export function RequirementFilters({ params, people, update, onClear, showDev = true }: RequirementFiltersProps) {
  const set = (key: string) => (value: string | undefined) => update({ [key]: value })
  const developers = people.filter((p) => p.roles.includes(Role.Developer))
  return (
    <>
      <SearchBox value={params.q ?? ""} onChange={(v) => update({ [SearchParam.Query]: v })} />
      <FilterSelect hideLabel label="Assignee" value={params.assignee} onChange={set(SearchParam.Assignee)}
        options={[{ value: FILTER_ALL, label: "Assignee" }, { value: UNASSIGNED, label: "Unassigned" }, ...developers.map((p) => ({ value: p.id, label: p.fullName }))]} />
      <FilterSelect hideLabel label="Priority" value={params.priority} onChange={set(SearchParam.Priority)} options={optionsFrom("Priority", PRIORITY_LABEL)} className="min-w-0" />
      {showDev && <FilterSelect hideLabel label="Dev status" value={params.dev} onChange={set(SearchParam.Dev)} options={optionsFrom("Dev status", DEV_STATUS_LABEL)} className="min-w-0" />}
      <FilterSelect hideLabel label="QA status" value={params.qa} onChange={set(SearchParam.Qa)} options={optionsFrom("QA status", QA_STATUS_LABEL)} className="min-w-0" />
      <FilterSelect hideLabel label="Spec status" value={params.spec} onChange={set(SearchParam.Spec)} options={optionsFrom("Spec status", SPEC_STATUS_LABEL)} className="min-w-0" />
      {hasActiveFilters(params) && <Button variant="link" className="px-2!" onClick={onClear}>Clear</Button>}
    </>
  )
}

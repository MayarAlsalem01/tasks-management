"use client"

import { InfoIcon } from "lucide-react"

import { FilterSelect } from "@/components/ui/filter-select"
import { SearchParam } from "@/lib/routes"

import type { ProjectPerson } from "../types/requirement"
import { BOARD_LANES_LABEL, BoardLanes } from "../types/table"
import type { FrPermissions } from "../utils/permissions"
import type { TableParams } from "../utils/table-params"
import { RequirementFilters } from "./requirement-filters"

function roleNote({ canManage, canEditDev }: FrPermissions) {
  if (canManage) return "Drag cards to change dev status. Dropping an incomplete card into Done asks for an override. Use the avatar on a card to reassign."
  if (canEditDev) return "Drag cards between Not started, In progress and Blocked. Done unlocks when all ACs are dev-done."
  return "View only: cards can't be moved. Open a card to update QA status and AC QA controls."
}

type BoardToolbarProps = {
  params: TableParams
  people: ProjectPerson[]
  permissions: FrPermissions
  update: (changes: Record<string, string | undefined>) => void
  onClear: () => void
}

/** Board filters (no Dev filter: the columns are dev status), swimlane mode and what the viewer's role can do. */
export function BoardToolbar({ params, people, permissions, update, onClear }: BoardToolbarProps) {
  return (
    <div className="flex flex-none flex-col gap-2.5 px-4 pt-3 pb-2.5 lg:px-6">
      <div className="flex flex-wrap items-center gap-2">
        <RequirementFilters params={params} people={people} update={update} onClear={onClear} showDev={false} />
        <span className="flex-1" />
        <FilterSelect
          label="Swimlanes"
          value={params.lanes}
          onChange={(v) => update({ [SearchParam.Lanes]: v === BoardLanes.Activity ? undefined : v })}
          options={Object.entries(BOARD_LANES_LABEL).map(([value, label]) => ({ value, label }))}
        />
      </div>
      <p className="flex items-center gap-2 rounded-md border border-gray-150 bg-gray-25 px-2.5 py-[7px] text-caption text-gray-700">
        <InfoIcon className="size-3.5 flex-none text-gray-600" />
        {roleNote(permissions)}
      </p>
    </div>
  )
}

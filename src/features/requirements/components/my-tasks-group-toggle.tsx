"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { SearchParam, withQuery } from "@/lib/routes"

import { TASK_GROUP_LABEL, TaskGroupBy } from "../types/my-tasks"
import { parseTaskGroup } from "../utils/my-tasks"

/** "Group by Project / Due date" for My Tasks, kept in `?group=` (Project is the default and leaves the URL clean). */
export function MyTasksGroupToggle() {
  const router = useRouter()
  const pathname = usePathname()
  const value = parseTaskGroup(useSearchParams().get(SearchParam.Group))

  const select = (next: string) => {
    if (!next) return
    router.replace(withQuery(pathname, { [SearchParam.Group]: next === TaskGroupBy.Project ? undefined : next }), { scroll: false })
  }

  return (
    <span className="flex items-center gap-2 text-caption text-gray-600">
      Group by
      <ToggleGroup type="single" value={value} onValueChange={select} size="sm" spacing={0.5} className="rounded-[7px] bg-gray-75 p-0.5">
        {Object.values(TaskGroupBy).map((option) => (
          <ToggleGroupItem
            key={option}
            value={option}
            className="h-[26px] px-3 text-caption text-gray-600 hover:bg-transparent data-[state=on]:bg-white data-[state=on]:text-foreground data-[state=on]:shadow-e1"
          >
            {TASK_GROUP_LABEL[option]}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </span>
  )
}

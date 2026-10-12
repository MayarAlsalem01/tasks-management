import { Skeleton } from "@/components/ui/skeleton"
import { TableSkeleton } from "@/components/ui/table-skeleton"

import { PROJECTS_GRID } from "../utils/table-layout"

/** Admin Projects table placeholder. */
export function ProjectsTableSkeleton() {
  return (
    <div className="overflow-x-auto">
      <TableSkeleton columns={PROJECTS_GRID} rows={5} rowClassName="h-15" minWidth={900} />
    </div>
  )
}

/** Mobile Projects list placeholder. */
export function ProjectsListSkeleton() {
  return (
    <div className="divide-y divide-gray-75 border-y border-gray-150" aria-busy="true">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex min-h-14 items-center gap-3 px-4">
          <Skeleton className="h-7 w-10 bg-gray-100" />
          <Skeleton className="h-3 w-40 bg-gray-75" />
        </div>
      ))}
    </div>
  )
}

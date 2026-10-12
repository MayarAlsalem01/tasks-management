import { Skeleton } from "@/components/ui/skeleton"
import { TableSkeleton } from "@/components/ui/table-skeleton"

import { TASK_GRID } from "../utils/my-tasks"

/** Tiles and task table placeholder, with the table's real column template. */
export function MyTasksSkeleton() {
  return (
    <div aria-busy="true" className="flex flex-col gap-4 px-4 py-4 lg:px-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex h-[92px] flex-col justify-center gap-2.5 rounded-xl border border-gray-150 px-3.5">
            <Skeleton className="h-2.5 w-24 bg-gray-75" />
            <Skeleton className="h-5 w-10 bg-gray-75" />
            <Skeleton className="h-2 w-28 bg-gray-75" />
          </div>
        ))}
      </div>
      <div className="overflow-x-auto">
        <TableSkeleton columns={TASK_GRID} rows={8} rowClassName="h-11" minWidth={1000} />
      </div>
    </div>
  )
}

/** Stand-in for the header's "n FRs · p projects" while it streams. */
export function MyTasksMetaSkeleton() {
  return <Skeleton className="inline-block h-2.5 w-28 bg-gray-75 align-middle" />
}

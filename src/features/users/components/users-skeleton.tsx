import { Skeleton } from "@/components/ui/skeleton"
import { TableSkeleton } from "@/components/ui/table-skeleton"

import { USERS_GRID } from "../utils/table-layout"

/** Filters bar + table placeholder shown while the Users page data streams in. */
export function UsersSkeleton() {
  return (
    <>
      <div className="flex flex-wrap items-center gap-2 pb-3">
        <Skeleton className="h-8 w-full bg-gray-75 sm:w-60" />
        {[0, 1, 2].map((i) => <Skeleton key={i} className="h-8 w-40 bg-gray-75" />)}
      </div>
      <div className="overflow-x-auto">
        <TableSkeleton columns={USERS_GRID} minWidth={1080} />
      </div>
    </>
  )
}

import { Skeleton } from "@/components/ui/skeleton"
import { TableSkeleton } from "@/components/ui/table-skeleton"

import { frGridTemplate, FR_COLUMNS } from "../utils/table-layout"

/** Toolbar and table placeholder with the table's real column template. */
export function RequirementsSkeleton() {
  return (
    <div aria-busy="true" className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-none items-center gap-2 border-b border-gray-150 px-4 py-3 lg:px-6">
        <Skeleton className="h-8 w-50 bg-gray-75" />
        {[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="hidden h-8 w-24 bg-gray-75 sm:block" />)}
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">
        <TableSkeleton columns={frGridTemplate(FR_COLUMNS)} rows={10} rowClassName="h-10" minWidth={1100} className="rounded-none border-0" />
      </div>
    </div>
  )
}

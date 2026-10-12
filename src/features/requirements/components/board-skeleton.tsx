import { Skeleton } from "@/components/ui/skeleton"

import { BOARD_GRID } from "./board-columns"

const CARDS_PER_COLUMN = [3, 2, 1, 2]

/** Toolbar, role note and four card columns, sized like the loaded board. */
export function BoardSkeleton() {
  return (
    <div aria-busy="true" className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex flex-none flex-col gap-2.5 px-4 pt-3 pb-2.5 lg:px-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-50 bg-gray-75" />
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="hidden h-8 w-24 bg-gray-75 sm:block" />)}
        </div>
        <Skeleton className="h-[34px] w-full bg-gray-50" />
      </div>
      <div className="min-w-max px-4 lg:px-6">
        <div className={`${BOARD_GRID} pt-1 pb-2`}>
          {CARDS_PER_COLUMN.map((_, i) => <Skeleton key={i} className="h-7 w-28 bg-gray-75" />)}
        </div>
        <Skeleton className="mb-2 h-[34px] w-full bg-gray-50" />
        <div className={BOARD_GRID}>
          {CARDS_PER_COLUMN.map((count, i) => (
            <div key={i} className="flex flex-col gap-2 rounded-[10px] bg-gray-25 p-2">
              {Array.from({ length: count }, (_, j) => <Skeleton key={j} className="h-[132px] rounded-lg border border-gray-150 bg-white" />)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

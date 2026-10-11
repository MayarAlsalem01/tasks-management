import { cn } from "cn"

import { Skeleton } from "@/components/ui/skeleton"

const WIDTHS = ["w-3/4", "w-1/2", "w-2/3", "w-5/6", "w-3/5"]

/**
 * Loading placeholder shaped like the app's grid tables: a header strip plus `rows` rows.
 * `columns` is a CSS grid template so it lines up with the real table it stands in for.
 */
function TableSkeleton({
  columns,
  rows = 8,
  rowClassName = "h-12",
  minWidth,
  className,
}: {
  columns: string
  rows?: number
  rowClassName?: string
  minWidth?: number
  className?: string
}) {
  const count = columns.trim().split(/\s+(?![^(]*\))/).length
  const grid = { gridTemplateColumns: columns, minWidth }
  return (
    <div aria-busy="true" aria-label="Loading" className={cn("overflow-hidden rounded-lg border border-gray-150", className)}>
      <div className="grid h-9 items-center gap-4 border-b border-gray-150 bg-gray-25 px-4" style={grid}>
        {Array.from({ length: count }, (_, c) => <Skeleton key={c} className="h-2 w-12 bg-gray-100" />)}
      </div>
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} className={cn("grid items-center gap-4 border-b border-gray-75 px-4 last:border-b-0", rowClassName)} style={grid}>
          {Array.from({ length: count }, (_, c) => (
            <Skeleton key={c} className={cn("h-2.5 bg-gray-75", WIDTHS[(r + c) % WIDTHS.length])} />
          ))}
        </div>
      ))}
    </div>
  )
}

/** Placeholder for a row of underline tabs while their counts load. */
function TabsSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div className="flex h-9 items-center gap-4 px-2.5">
      {Array.from({ length: count }, (_, i) => <Skeleton key={i} className="h-2.5 w-16 bg-gray-100" />)}
    </div>
  )
}

export { TableSkeleton, TabsSkeleton }

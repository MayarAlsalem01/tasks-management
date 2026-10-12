import { Skeleton } from "@/components/ui/skeleton"

/** Notification list placeholder (avatar + two text lines per row). */
export function NotificationsSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div aria-busy="true" aria-label="Loading notifications">
      <div className="flex h-12 items-center border-b border-gray-75 px-3.5">
        <Skeleton className="h-3 w-28 bg-gray-100" />
      </div>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="grid grid-cols-[32px_1fr] gap-3 border-b border-gray-75 px-3.5 py-3">
          <Skeleton className="size-8 rounded-full bg-gray-100" />
          <div className="flex flex-col gap-2 pt-1">
            <Skeleton className="h-2.5 w-4/5 bg-gray-75" />
            <Skeleton className="h-2 w-1/3 bg-gray-75" />
          </div>
        </div>
      ))}
    </div>
  )
}

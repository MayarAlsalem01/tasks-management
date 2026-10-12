import { Skeleton } from "@/components/ui/skeleton"

const CARD = "rounded-[10px] border border-gray-150 bg-white"

/** Metric cards, the activity rollup, status bars and attention lists, sized like the loaded dashboard. */
export function DashboardSkeleton() {
  return (
    <div aria-busy="true" className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`${CARD} flex h-[132px] flex-col gap-3 px-[18px] py-4`}>
            <Skeleton className="h-3 w-28 bg-gray-75" />
            <Skeleton className="h-10 w-20 bg-gray-100" />
            <Skeleton className="h-4 w-32 bg-gray-75" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <div className={`${CARD} flex flex-col gap-4 px-5 py-[18px]`}>
          <Skeleton className="h-4 w-56 bg-gray-100" />
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-11 w-full bg-gray-50" />)}
        </div>
        <div className={`${CARD} flex flex-col gap-4 px-5 py-[18px]`}>
          <Skeleton className="h-4 w-36 bg-gray-100" />
          {[0, 1].map((i) => <Skeleton key={i} className="h-24 w-full bg-gray-50" />)}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`${CARD} flex flex-col gap-3 px-4 py-3.5`}>
            <Skeleton className="h-6 w-40 bg-gray-75" />
            <Skeleton className="h-11 w-full bg-gray-50" />
          </div>
        ))}
      </div>
    </div>
  )
}

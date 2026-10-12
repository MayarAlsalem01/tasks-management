import { Skeleton } from "@/components/ui/skeleton"

/** Sidebar placeholder: switcher, My Tasks, views and a few tree rows. */
export function SidebarSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading navigation" className="flex flex-1 flex-col">
      <div className="flex h-13 items-center gap-2 border-b border-gray-150 px-4.5">
        <Skeleton className="size-6 bg-gray-150" />
        <Skeleton className="h-3 w-32 bg-gray-150" />
      </div>
      <div className="flex flex-col gap-3 px-4 py-4">
        {[28, 20, 24, 22, 32, 26, 18].map((w, i) => (
          <Skeleton key={i} className="h-3 bg-gray-100" style={{ width: `${w * 4}px` }} />
        ))}
      </div>
    </div>
  )
}

/** Bell + user menu placeholder for the desktop header. */
export function HeaderActionsSkeleton() {
  return (
    <div className="flex items-center gap-3" aria-busy="true">
      <Skeleton className="size-8 rounded-md bg-gray-75" />
      <span className="h-6 w-px bg-gray-150" />
      <Skeleton className="size-7 rounded-full bg-gray-100" />
      <Skeleton className="h-3 w-24 bg-gray-75" />
    </div>
  )
}

/** Mobile top bar placeholder (same height, so content doesn't jump). */
export function MobileTopBarSkeleton() {
  return (
    <div className="flex h-13 flex-none items-center border-b border-gray-150 px-4 lg:hidden">
      <Skeleton className="h-4 w-32 bg-gray-100" />
    </div>
  )
}

/** Mobile tab bar placeholder. */
export function MobileTabBarSkeleton() {
  return <div className="fixed inset-x-0 bottom-0 z-40 h-17 border-t border-gray-150 bg-white lg:hidden" />
}

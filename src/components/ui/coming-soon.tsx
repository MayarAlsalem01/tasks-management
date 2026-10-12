import { cn } from "cn"

const WIDTHS = [78, 62, 84, 55, 70, 66, 80, 58, 74, 60]

/**
 * Placeholder for screens that aren't built yet: a skeleton table behind a dashed
 * "coming soon" note, as in the App Shell design's content region.
 */
function ComingSoon({ title, description, className }: { title: string; description: string; className?: string }) {
  return (
    <div className={cn("relative flex-1 p-4 lg:px-6", className)}>
      <div aria-hidden className="overflow-hidden rounded-lg border border-gray-150">
        <div className="h-9 border-b border-gray-150 bg-gray-25" />
        {WIDTHS.map((width, i) => (
          <div key={i} className="flex h-10 items-center gap-4 border-b border-gray-75 px-4">
            <span className="h-2 w-18 rounded-full bg-gray-100" />
            <span className="h-2 rounded-full bg-gray-75" style={{ width: `${width / 2}%` }} />
            <span className="ml-auto hidden h-5 w-22 rounded-xs bg-gray-75 sm:block" />
          </div>
        ))}
      </div>
      <div className="absolute top-[40%] left-1/2 flex w-[min(90%,360px)] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 rounded-lg border border-dashed border-gray-400 bg-white px-4 py-3 text-center shadow-e2">
        <span className="font-mono text-overline tracking-wider text-gray-600 uppercase">{title}</span>
        <span className="text-ui text-foreground">{description}</span>
      </div>
    </div>
  )
}

export { ComingSoon }

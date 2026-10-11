import * as React from "react"
import { cn } from "cn"

type EmptyStateProps = {
  icon: React.ReactNode
  title: string
  description: React.ReactNode
  action?: React.ReactNode
  className?: string
  children?: React.ReactNode
}

function EmptyState({ icon, title, description, action, className, children }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2.5 rounded-lg border bg-card px-6 py-8 text-center",
        className
      )}
    >
      <span className="inline-flex size-10 items-center justify-center rounded-lg bg-gray-50 text-gray-500 [&_svg]:size-4">
        {icon}
      </span>
      <span className="text-title-3">{title}</span>
      <span className="max-w-[260px] text-ui text-muted-foreground">{description}</span>
      {action && <div className="mt-1 flex gap-2">{action}</div>}
      {children}
    </div>
  )
}

export { EmptyState }

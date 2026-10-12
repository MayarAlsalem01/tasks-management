import { cn } from "cn"

import { projectColor } from "../utils/project-color"

const SIZES = {
  sm: "h-6 w-6 rounded-md text-[9px]",
  md: "h-[22px] w-[34px] rounded-[5px] text-[9px]",
  lg: "h-7 w-10 rounded-md text-[10px]",
}

/** The coloured project key tile (e.g. "PAY") used in switchers, tables and headers. */
export function ProjectBadge({
  code,
  archived = false,
  size = "sm",
  className,
}: {
  code: string
  archived?: boolean
  size?: keyof typeof SIZES
  className?: string
}) {
  return (
    <span
      aria-hidden
      style={{ backgroundColor: projectColor(code, archived) }}
      className={cn(
        "inline-flex flex-none items-center justify-center font-mono font-semibold text-white",
        SIZES[size],
        className,
      )}
    >
      {code}
    </span>
  )
}

"use client"

import type { ReactNode } from "react"

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

/**
 * Wraps a disabled control with a "coming soon" tooltip. Disabled buttons don't fire pointer
 * events, so the tooltip is attached to a focusable wrapper instead.
 */
export function ComingSoonHint({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span tabIndex={0} className="inline-flex rounded-md outline-none focus-visible:shadow-focus">
          {children}
        </span>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

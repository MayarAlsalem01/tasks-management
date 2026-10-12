"use client"

import { cn } from "cn"
import { ChevronDownIcon, ChevronRightIcon, PlusIcon } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import type { ProjectNav } from "@/features/projects"

import { NewItem, ROUTES, SearchParam, withQuery } from "@/lib/routes"

/**
 * Activities → Steps tree for the current project with FR counts. Selecting a step filters
 * the current view via `?step=<id>`. The first activity starts expanded.
 */
export function ActivityTree({
  project,
  viewHref,
  activeStepId,
  isAdmin,
}: {
  project: ProjectNav
  /** Path of the current project view, e.g. `/projects/PAY/table`. */
  viewHref: string
  activeStepId: string | null
  isAdmin: boolean
}) {
  const initiallyOpen = project.activities.find((a) => a.steps.some((s) => s.id === activeStepId))?.id ?? project.activities[0]?.id
  const [open, setOpen] = useState<string[]>(initiallyOpen ? [initiallyOpen] : [])
  const toggle = (id: string) => setOpen((ids) => (ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id]))

  if (project.activities.length === 0) {
    return <p className="px-2 py-1 text-caption text-gray-600">No activities yet.</p>
  }

  return project.activities.map((activity) => {
    const expanded = open.includes(activity.id)
    const Chevron = expanded ? ChevronDownIcon : ChevronRightIcon
    return (
      <div key={activity.id} className="flex flex-col gap-px">
        <button
          type="button"
          onClick={() => toggle(activity.id)}
          aria-expanded={expanded}
          className="flex h-7 items-center gap-1.5 rounded-md px-2 text-left text-ui text-gray-700 outline-none hover:bg-gray-100 focus-visible:shadow-focus aria-expanded:font-medium aria-expanded:text-foreground"
        >
          <Chevron className="size-3 text-gray-600" />
          <span className="flex-1 truncate">{activity.name}</span>
          <span className="font-mono text-overline text-gray-600">{activity.frCount}</span>
        </button>
        {expanded && (
          <div className="ml-3.5 flex flex-col gap-px border-l border-gray-200 pl-2">
            {activity.steps.map((step) => (
              <Link
                key={step.id}
                href={withQuery(viewHref, { [SearchParam.Step]: step.id })}
                aria-current={step.id === activeStepId ? "page" : undefined}
                className={cn(
                  "flex h-7 items-center gap-1.5 rounded-md px-2 text-ui outline-none focus-visible:shadow-focus",
                  step.id === activeStepId ? "bg-white font-medium shadow-[0_0_0_1px_var(--color-gray-150)]" : "text-gray-700 hover:bg-gray-100",
                )}
              >
                <span className="flex-1 truncate">{step.name}</span>
                <span className="font-mono text-overline text-gray-600">{step.frCount}</span>
              </Link>
            ))}
            {isAdmin && (
              <Link
                href={withQuery(ROUTES.project(project.code), { [SearchParam.New]: NewItem.Step, [SearchParam.Parent]: activity.id })}
                scroll={false}
                className="flex h-7 items-center gap-1.5 rounded-md px-2 text-caption text-gray-600 outline-none hover:bg-gray-100 hover:text-foreground focus-visible:shadow-focus"
              >
                <PlusIcon className="size-2.5" />
                Add step
              </Link>
            )}
          </div>
        )}
      </div>
    )
  })
}

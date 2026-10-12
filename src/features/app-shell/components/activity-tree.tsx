"use client"

import { cn } from "cn"
import { ChevronDownIcon, ChevronRightIcon, PlusIcon } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

import type { ProjectNav, ProjectNavStep } from "@/features/projects"
import { StructureKind } from "@/features/requirements"
import { NewItem, ROUTES, SearchParam, withQuery } from "@/lib/routes"

import { StructureNodeMenu } from "./structure-node-menu"

// While the "⋯" menu is showing, it takes the FR count's place.
const countBehindMenu = "group-hover/node:invisible group-has-[:focus-visible]/node:invisible group-has-data-[state=open]/node:invisible"

function StepRow({ step, href, active, isAdmin, onDeleted }: { step: ProjectNavStep; href: string; active: boolean; isAdmin: boolean; onDeleted: () => void }) {
  return (
    <div className="group/node relative">
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex h-7 items-center gap-1.5 rounded-md px-2 text-ui outline-none focus-visible:shadow-focus",
          active ? "bg-white font-medium shadow-[0_0_0_1px_var(--color-gray-150)]" : "text-gray-700 hover:bg-gray-100",
        )}
      >
        <span className="flex-1 truncate">{step.name}</span>
        <span className={cn("font-mono text-overline text-gray-600", isAdmin && countBehindMenu)}>{step.frCount}</span>
      </Link>
      {isAdmin && <StructureNodeMenu node={{ kind: StructureKind.Step, id: step.id, name: step.name, frCount: step.frCount }} onDeleted={onDeleted} />}
    </div>
  )
}

/**
 * Activities → Steps tree for the current project with FR counts. Selecting a step filters
 * the current view via `?step=<id>`. The first activity starts expanded. Admins/POs get a
 * per-row menu to rename or delete; deleting the selected step (or its activity) clears the
 * selection.
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
  const router = useRouter()
  const leaveIfSelected = (stepIds: string[]) => () => {
    if (activeStepId && stepIds.includes(activeStepId)) router.replace(viewHref)
  }

  if (project.activities.length === 0) {
    return <p className="px-2 py-1 text-caption text-gray-600">No activities yet.</p>
  }

  return project.activities.map((activity) => {
    const expanded = open.includes(activity.id)
    const Chevron = expanded ? ChevronDownIcon : ChevronRightIcon
    return (
      <div key={activity.id} className="flex flex-col gap-px">
        <div className="group/node relative">
          <button
            type="button"
            onClick={() => toggle(activity.id)}
            aria-expanded={expanded}
            className="flex h-7 w-full items-center gap-1.5 rounded-md px-2 text-left text-ui text-gray-700 outline-none hover:bg-gray-100 focus-visible:shadow-focus aria-expanded:font-medium aria-expanded:text-foreground"
          >
            <Chevron className="size-3 text-gray-600" />
            <span className="flex-1 truncate">{activity.name}</span>
            <span className={cn("font-mono text-overline text-gray-600", isAdmin && countBehindMenu)}>{activity.frCount}</span>
          </button>
          {isAdmin && (
            <StructureNodeMenu
              node={{ kind: StructureKind.Activity, id: activity.id, name: activity.name, frCount: activity.frCount, stepCount: activity.steps.length }}
              onDeleted={leaveIfSelected(activity.steps.map((s) => s.id))}
            />
          )}
        </div>
        {expanded && (
          <div className="ml-3.5 flex flex-col gap-px border-l border-gray-200 pl-2">
            {activity.steps.map((step) => (
              <StepRow
                key={step.id}
                step={step}
                href={withQuery(viewHref, { [SearchParam.Step]: step.id })}
                active={step.id === activeStepId}
                isAdmin={isAdmin}
                onDeleted={leaveIfSelected([step.id])}
              />
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

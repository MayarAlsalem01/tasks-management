"use client"

import { FilterIcon, PlusIcon } from "lucide-react"
import { useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { NavTabs } from "@/components/ui/nav-tabs"
import { PageHeader, type Crumb } from "@/components/ui/page-header"
import { Skeleton } from "@/components/ui/skeleton"
import type { ProjectNav } from "@/features/projects"

import { PROJECT_VIEWS } from "../utils/navigation"
import { ComingSoonHint } from "./coming-soon-button"
import { ROUTES, SearchParam, withQuery } from "@/lib/routes"

/**
 * Header for project pages: breadcrumb (Project / Activity / Step), title and FR count for
 * the selected step or whole project, Filter and New FR (coming soon), and the view tabs.
 */
export function ProjectPageHeader({ project, isAdmin }: { project: ProjectNav; isAdmin: boolean }) {
  const stepId = useSearchParams().get(SearchParam.Step)
  const activity = project.activities.find((a) => a.steps.some((s) => s.id === stepId))
  const step = activity?.steps.find((s) => s.id === stepId)

  const breadcrumb: Crumb[] = [{ label: project.name, href: step ? ROUTES.project(project.code) : undefined }]
  if (activity && step) breadcrumb.push({ label: activity.name }, { label: step.name })
  const count = step?.frCount ?? project.frCount
  
  return (
    <PageHeader
      breadcrumb={breadcrumb}
      title={step?.name ?? project.name}
      meta={`${count} ${count === 1 ? "FR" : "FRs"}`}
      actions={
        <>
          <ComingSoonHint label="Filters are coming soon">
            <Button variant="outline" disabled><FilterIcon />Filter</Button>
          </ComingSoonHint>
          {isAdmin && (
            <ComingSoonHint label="Creating FRs is coming soon">
              <Button disabled><PlusIcon />New FR</Button>
            </ComingSoonHint>
          )}
        </>
      }
      tabs={<NavTabs tabs={PROJECT_VIEWS.map(({ view, label }) => ({ label, href: withQuery(ROUTES.project(project.code, view), { [SearchParam.Step]: step?.id }) }))} />}
    />
  )
}

/** Placeholder with the header's height while the project tree loads. */
export function ProjectPageHeaderSkeleton() {
  return (
    <div aria-busy="true" className="flex flex-none flex-col gap-3 border-b border-gray-150 px-4 pt-4 lg:px-6">
      <Skeleton className="h-2.5 w-40 bg-gray-75" />
      <Skeleton className="h-6 w-56 bg-gray-100" />
      <div className="flex h-9 items-center gap-4">
        {[0, 1, 2].map((i) => <Skeleton key={i} className="h-2.5 w-14 bg-gray-75" />)}
      </div>
    </div>
  )
}

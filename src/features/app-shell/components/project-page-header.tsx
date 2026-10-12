"use client"

import { PlusIcon } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { NavTabs } from "@/components/ui/nav-tabs"
import { PageHeader, type Crumb } from "@/components/ui/page-header"
import { Skeleton } from "@/components/ui/skeleton"
import type { ProjectNav } from "@/features/projects"

import { NewItem, ROUTES, SearchParam, withQuery } from "@/lib/routes"

import { PROJECT_VIEWS } from "../utils/navigation"

/**
 * Header for project pages: breadcrumb (Project / Activity / Step), title and FR count for
 * the selected step or whole project, the admin create actions (they open dialogs on the
 * table view, in the selected step), and the view tabs.
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
        isAdmin && (
          <>
            <Button variant="outline" asChild>
              <Link href={withQuery(ROUTES.project(project.code), { [SearchParam.Step]: step?.id, [SearchParam.New]: NewItem.Activity })} scroll={false}>New activity</Link>
            </Button>
            {project.activities.length > 0 && (
              <Button asChild>
                <Link href={withQuery(ROUTES.project(project.code), { [SearchParam.Step]: step?.id, [SearchParam.New]: NewItem.Fr, [SearchParam.Parent]: step?.id })} scroll={false}><PlusIcon />New FR</Link>
              </Button>
            )}
          </>
        )
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

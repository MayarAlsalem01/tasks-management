import { InfoIcon, PlusIcon } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"

import { Button } from "@/components/ui/button"
import { NavTabs } from "@/components/ui/nav-tabs"
import { PageHeader } from "@/components/ui/page-header"
import { TabsSkeleton } from "@/components/ui/table-skeleton"
import { requireAdminPage } from "@/lib/auth/session"
import { AdminProjectsTab, ROUTES, SearchParam, withQuery } from "@/lib/routes"

import { getAdminProjects, getMemberOptions } from "../cache/queries"
import { ProjectsTableSkeleton } from "./projects-skeleton"
import { ProjectsManager } from "./projects-manager"

type SearchParams = Promise<Record<string, string | string[] | undefined>>

const ARCHIVED_HREF = withQuery(ROUTES.admin.projects, { [SearchParam.Tab]: AdminProjectsTab.Archived })

/** Whether the Archived tab is selected. */
async function isArchivedTab(searchParams: SearchParams) {
  const params = await searchParams
  return params[SearchParam.Tab] === AdminProjectsTab.Archived
}

async function ProjectTabs({ searchParams }: { searchParams: SearchParams }) {
  await requireAdminPage()
  const [archived, active, archivedRows] = await Promise.all([isArchivedTab(searchParams), getAdminProjects(false), getAdminProjects(true)])
  return (
    <NavTabs
      tabs={[
        { label: "Active", href: ROUTES.admin.projects, count: active.length, active: !archived },
        { label: "Archived", href: ARCHIVED_HREF, count: archivedRows.length, active: archived },
      ]}
    />
  )
}

async function ProjectsContent({ searchParams }: { searchParams: SearchParams }) {
  await requireAdminPage()
  const archived = await isArchivedTab(searchParams)
  const [rows, memberOptions] = await Promise.all([getAdminProjects(archived), getMemberOptions()])
  return (
    <>
      {archived && (
        <div className="flex items-start gap-2.5 rounded-lg border border-info-border bg-info-bg px-3.5 py-2.5 text-ui text-info-fg">
          <InfoIcon className="mt-0.5 size-4 flex-none text-info-solid" />
          Archived projects are read-only and hidden from project switchers. All FRs, ACs and history
          are kept, and restoring brings them back exactly as they were.
        </div>
      )}
      <ProjectsManager rows={rows} memberOptions={memberOptions} />
    </>
  )
}

/**
 * Admin › Projects (Active / Archived). The header is part of the static shell; tab counts
 * and the table stream in behind skeletons, each checking admin access itself.
 */
export function ProjectsAdminPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        breadcrumb={[{ label: "Admin" }, { label: "Projects" }]}
        title="Projects"
        actions={
          <Button asChild>
            <Link href={withQuery(ROUTES.admin.projects, { [SearchParam.New]: "1" })}><PlusIcon />New project</Link>
          </Button>
        }
        tabs={
          <Suspense fallback={<TabsSkeleton />}>
            <ProjectTabs searchParams={searchParams} />
          </Suspense>
        }
      />
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-auto p-4 lg:px-6">
        <Suspense fallback={<ProjectsTableSkeleton />}>
          <ProjectsContent searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  )
}

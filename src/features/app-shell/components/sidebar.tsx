"use client"

import {
  BarChart3Icon,
  FolderIcon,
  KanbanSquareIcon,
  ListIcon,
  PlusIcon,
  SquareCheckIcon,
  TableIcon,
  UserIcon,
} from "lucide-react"
import { usePathname, useSearchParams } from "next/navigation"

import { ProjectSwitcher, type ProjectNav, type ProjectSummary } from "@/features/projects"

import { parseProjectPath, PROJECT_VIEWS } from "../utils/navigation"
import { ActivityTree } from "./activity-tree"
import { ComingSoonHint } from "./coming-soon-button"
import { NavItem, NavSection } from "./nav-item"
import { ProjectView, ROUTES, SearchParam } from "@/lib/routes"

const VIEW_ICONS = {
  [ProjectView.Table]: <TableIcon />,
  [ProjectView.Board]: <KanbanSquareIcon />,
  [ProjectView.Dashboard]: <BarChart3Icon />,
}

export type SidebarProps = {
  projects: ProjectSummary[]
  navs: ProjectNav[]
  isAdmin: boolean
  archivedCount: number
  /** Open FRs assigned to the viewer across projects (My Tasks badge). */
  taskCount: number
}

/**
 * Desktop sidebar content: project switcher, My Tasks, the current project's views and
 * Activities → Steps tree, and (Admin/PO only) the Admin section. The current project comes
 * from the URL and falls back to the first accessible project.
 */
export function Sidebar({ projects, navs, isAdmin, archivedCount, taskCount }: SidebarProps) {
  const pathname = usePathname()
  const activeStepId = useSearchParams().get(SearchParam.Step)
  const route = parseProjectPath(pathname)
  const current = navs.find((n) => n.code === route?.code) ?? navs[0] ?? null
  const currentSummary = projects.find((p) => p.id === current?.id) ?? null
  const view = route?.view ?? ProjectView.Table

  return (
    <>
      <div className="flex h-13 flex-none items-center border-b border-gray-150 px-2.5">
        <ProjectSwitcher projects={projects} current={currentSummary} isAdmin={isAdmin} archivedCount={archivedCount} />
      </div>

      <nav aria-label="Main" className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-2 py-2.5">
        <NavItem
          href={ROUTES.myTasks}
          icon={<SquareCheckIcon />}
          label="My Tasks"
          active={pathname.startsWith(ROUTES.myTasks)}
          trailing={<span className="rounded-xs bg-gray-150 px-1.5 font-mono text-overline text-gray-700">{taskCount}</span>}
        />

        {current && (
          <>
            <NavSection label="Views">
              {PROJECT_VIEWS.map(({ view: v, label }) => (
                <NavItem
                  key={v}
                  href={ROUTES.project(current.code, v)}
                  icon={VIEW_ICONS[v]}
                  label={label}
                  active={route?.code === current.code && view === v}
                />
              ))}
            </NavSection>
            <NavSection
              label="Activities"
              action={
                isAdmin && (
                  <ComingSoonHint label="Adding activities is coming soon">
                    <PlusIcon aria-label="Add activity" className="size-3 text-gray-500" />
                  </ComingSoonHint>
                )
              }
            >
              <ActivityTree
                key={current.id}
                project={current}
                viewHref={ROUTES.project(current.code, view)}
                activeStepId={route?.code === current.code ? activeStepId : null}
                isAdmin={isAdmin}
              />
            </NavSection>
          </>
        )}

        {isAdmin && (
          <NavSection label="Admin">
            <NavItem href={ROUTES.admin.users} icon={<UserIcon />} label="Users" active={pathname.startsWith(ROUTES.admin.users)} />
            <NavItem href={ROUTES.admin.projects} icon={<FolderIcon />} label="Projects" active={pathname.startsWith(ROUTES.admin.projects)} />
            <NavItem href={ROUTES.admin.audit} icon={<ListIcon />} label="Audit log" active={pathname.startsWith(ROUTES.admin.audit)} />
          </NavSection>
        )}
      </nav>

      <div className="flex flex-none items-center gap-2 border-t border-gray-150 px-4 py-2.5 text-caption text-gray-600">
        <span className="size-2 rounded-full border-[1.5px] border-gray-400" />
        Live updates coming soon
      </div>
    </>
  )
}

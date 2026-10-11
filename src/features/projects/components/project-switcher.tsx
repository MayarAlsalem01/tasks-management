"use client"

import { CheckIcon, ChevronRightIcon, ChevronsUpDownIcon, PlusIcon } from "lucide-react"
import Link from "next/link"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import type { ProjectSummary } from "../types/project"
import { ProjectBadge } from "./project-badge"
import { AdminProjectsTab, ROUTES, SearchParam, withQuery } from "@/lib/routes"

type ProjectSwitcherProps = {
  projects: ProjectSummary[]
  current: ProjectSummary | null
  isAdmin: boolean
  archivedCount: number
}

/**
 * Sidebar project switcher. Lists the viewer's projects with their open-task counts; admins
 * also get shortcuts to archived projects, New project and Manage projects.
 */
export function ProjectSwitcher({ projects, current, isAdmin, archivedCount }: ProjectSwitcherProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex h-9 w-full items-center gap-2 rounded-md px-2 text-left outline-none hover:bg-gray-100 focus-visible:shadow-focus data-[state=open]:bg-gray-150">
        {current ? (
          <>
            <ProjectBadge code={current.code} />
            <span className="min-w-0 flex-1 truncate text-ui font-semibold">{current.name}</span>
          </>
        ) : (
          <span className="flex-1 text-ui text-gray-600">No projects yet</span>
        )}
        <ChevronsUpDownIcon className="size-3 text-gray-600" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-75">
        <DropdownMenuLabel className="font-mono text-[10px] tracking-wider text-gray-600 uppercase">
          Your projects
        </DropdownMenuLabel>
        {projects.length === 0 && (
          <p className="px-2 py-2 text-ui text-gray-600">You aren&apos;t a member of any project yet.</p>
        )}
        {projects.map((project) => (
          <DropdownMenuItem key={project.id} asChild className="h-9 gap-2.5">
            <Link href={ROUTES.project(project.code)}>
              <ProjectBadge code={project.code} size="md" />
              <span className="flex-1 truncate font-medium">{project.name}</span>
              <span className="text-overline text-gray-600">
                {project.mineCount ? `${project.mineCount} mine` : "—"}
              </span>
              <span className="w-3.5 text-cobalt-500">
                {current?.id === project.id && <CheckIcon className="size-3.5" />}
              </span>
            </Link>
          </DropdownMenuItem>
        ))}
        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="text-caption text-gray-600">
              <Link href={withQuery(ROUTES.admin.projects, { [SearchParam.Tab]: AdminProjectsTab.Archived })}>
                <ChevronRightIcon className="size-3" />
                Archived ({archivedCount})
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="font-medium text-cobalt-600">
              <Link href={withQuery(ROUTES.admin.projects, { [SearchParam.New]: "1" })}>
                <PlusIcon className="size-3.5" />
                New project
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={ROUTES.admin.projects} className="pl-7.5">
                Manage projects
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

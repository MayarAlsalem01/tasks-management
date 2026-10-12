import { ChevronRightIcon } from "lucide-react"
import Link from "next/link"

import { EmptyState } from "@/components/ui/empty-state"

import type { ProjectSummary } from "../types/project"
import { ProjectBadge } from "./project-badge"
import { ROUTES } from "@/lib/routes"

/** Tappable list of the viewer's projects (the mobile Projects tab). */
export function ProjectsList({ projects }: { projects: ProjectSummary[] }) {
  if (projects.length === 0) {
    return (
      <EmptyState
        icon={<ChevronRightIcon />}
        title="No projects yet"
        description="Ask an administrator to add you to a project."
        className="m-4"
      />
    )
  }
  return (
    <ul className="divide-y divide-gray-75 border-y border-gray-150 bg-white">
      {projects.map((project) => (
        <li key={project.id}>
          <Link href={ROUTES.project(project.code)} className="flex min-h-14 items-center gap-3 px-4 hover:bg-gray-25">
            <ProjectBadge code={project.code} size="lg" />
            <span className="flex-1 text-body font-medium">{project.name}</span>
            <span className="text-caption text-gray-600">{project.mineCount ? `${project.mineCount} mine` : ""}</span>
            <ChevronRightIcon className="size-4 text-gray-400" />
          </Link>
        </li>
      ))}
    </ul>
  )
}

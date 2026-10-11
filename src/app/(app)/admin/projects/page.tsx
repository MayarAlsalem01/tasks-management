import type { Metadata } from "next"

import { ProjectsAdminPage } from "@/features/projects/server"
import { APP_NAME } from "@/lib/config"

export const metadata: Metadata = { title: `Projects · ${APP_NAME}` }

export default function AdminProjectsPage({ searchParams }: PageProps<"/admin/projects">) {
  return <ProjectsAdminPage searchParams={searchParams} />
}

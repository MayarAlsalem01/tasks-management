import type { Metadata } from "next"
import { Suspense } from "react"

import { PageHeader } from "@/components/ui/page-header"
import { ProjectsList } from "@/features/projects"
import { getAccessibleProjects, ProjectsListSkeleton } from "@/features/projects/server"
import { requireUser } from "@/lib/auth/session"
import { APP_NAME } from "@/lib/config"

export const metadata: Metadata = { title: `Projects · ${APP_NAME}` }

async function MyProjects() {
  const user = await requireUser()
  return <ProjectsList projects={await getAccessibleProjects(user.id, user.isAdmin)} />
}

export default function ProjectsPage() {
  return (
    <>
      <PageHeader title="Projects" className="hidden lg:flex" />
      <Suspense fallback={<ProjectsListSkeleton />}>
        <MyProjects />
      </Suspense>
    </>
  )
}

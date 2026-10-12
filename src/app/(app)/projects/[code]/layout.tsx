import { notFound } from "next/navigation"
import { Suspense } from "react"

import { ProjectPageHeader, ProjectPageHeaderSkeleton } from "@/features/app-shell"
import { getProjectNavForUser } from "@/features/projects/server"
import { requireUser } from "@/lib/auth/session"

async function Header({ params }: { params: Promise<{ code: string }> }) {
  const [{ code }, user] = await Promise.all([params, requireUser()])
  const project = await getProjectNavForUser(code, user.id, user.isAdmin)
  if (!project) notFound()
  return <ProjectPageHeader project={project} isAdmin={user.isAdmin} />
}

export default function ProjectLayout({ children, params }: LayoutProps<"/projects/[code]">) {
  return (
    <>
      <Suspense fallback={<ProjectPageHeaderSkeleton />}>
        <Header params={params} />
      </Suspense>
      {children}
    </>
  )
}

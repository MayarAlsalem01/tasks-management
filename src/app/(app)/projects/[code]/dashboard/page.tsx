import { ProjectDashboardPage } from "@/features/requirements/server"

export default function ProjectDashboardRoute({ params, searchParams }: PageProps<"/projects/[code]/dashboard">) {
  return <ProjectDashboardPage params={params} searchParams={searchParams} />
}

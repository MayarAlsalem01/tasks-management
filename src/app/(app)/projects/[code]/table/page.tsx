import { RequirementsTablePage } from "@/features/requirements/server"

export default async function ProjectTablePage({ params }: PageProps<"/projects/[code]/table">) {
  return <RequirementsTablePage params={params} />
}

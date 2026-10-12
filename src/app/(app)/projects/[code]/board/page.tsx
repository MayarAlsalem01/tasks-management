import { RequirementsBoardPage } from "@/features/requirements/server"

export default async function ProjectBoardPage({ params }: PageProps<"/projects/[code]/board">) {
  return <RequirementsBoardPage params={params} />
}

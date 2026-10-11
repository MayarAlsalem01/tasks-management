import { redirect } from "next/navigation"
import { Suspense } from "react"

import { ROUTES } from "@/lib/routes"

async function RedirectToTable({ params }: { params: Promise<{ code: string }> }): Promise<null> {
  const { code } = await params
  redirect(ROUTES.project(code))
}

export default function ProjectIndex({ params }: PageProps<"/projects/[code]">) {
  return (
    <Suspense>
      <RedirectToTable params={params} />
    </Suspense>
  )
}

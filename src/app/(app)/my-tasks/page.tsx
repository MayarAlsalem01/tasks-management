import type { Metadata } from "next"
import { Suspense } from "react"

import { Skeleton } from "@/components/ui/skeleton"
import { PageHeader } from "@/components/ui/page-header"
import { MyTasksGroupToggle } from "@/features/requirements"
import { MyTasksMeta, MyTasksMetaSkeleton, MyTasksPage } from "@/features/requirements/server"
import { APP_NAME } from "@/lib/config"

export const metadata: Metadata = { title: `My Tasks · ${APP_NAME}` }

export default function MyTasksRoute() {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <PageHeader
        breadcrumb={[{ label: "Across all projects" }]}
        title="My Tasks"
        meta={<Suspense fallback={<MyTasksMetaSkeleton />}><MyTasksMeta /></Suspense>}
        actions={<Suspense fallback={<Skeleton className="h-[30px] w-52 bg-gray-75" />}><MyTasksGroupToggle /></Suspense>}
        className="border-b-0"
      />
      <MyTasksPage />
    </div>
  )
}

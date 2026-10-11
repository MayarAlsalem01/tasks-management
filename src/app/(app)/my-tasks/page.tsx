import type { Metadata } from "next"

import { ComingSoon } from "@/components/ui/coming-soon"
import { PageHeader } from "@/components/ui/page-header"
import { APP_NAME } from "@/lib/config"

export const metadata: Metadata = { title: `My Tasks · ${APP_NAME}` }

export default function MyTasksPage() {
  return (
    <>
      <PageHeader title="My Tasks" className="hidden lg:flex" />
      <ComingSoon title="My Tasks" description="Requirements assigned to you across projects arrive with the FR screens." />
    </>
  )
}

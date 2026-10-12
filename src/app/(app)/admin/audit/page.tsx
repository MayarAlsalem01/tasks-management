import type { Metadata } from "next"
import { Suspense } from "react"

import { ComingSoon } from "@/components/ui/coming-soon"
import { PageHeader } from "@/components/ui/page-header"
import { requireAdminPage } from "@/lib/auth/session"
import { APP_NAME } from "@/lib/config"

export const metadata: Metadata = { title: `Audit log · ${APP_NAME}` }

// Renders nothing; it only redirects non-admins away.
async function AdminOnly() {
  await requireAdminPage()
  return null
}

export default function AuditLogPage() {
  return (
    <>
      <Suspense>
        <AdminOnly />
      </Suspense>
      <PageHeader breadcrumb={[{ label: "Admin" }, { label: "Audit log" }]} title="Audit log" />
      <ComingSoon title="Audit log" description="Every recorded change is already being saved. The viewer arrives in a later stage." />
    </>
  )
}

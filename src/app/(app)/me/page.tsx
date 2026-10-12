import type { Metadata } from "next"
import { Suspense } from "react"

import { MePanel, MePanelSkeleton } from "@/features/app-shell"
import { formatRoles } from "@/lib/auth/roles"
import { requireUser } from "@/lib/auth/session"
import { APP_NAME } from "@/lib/config"

export const metadata: Metadata = { title: `Me · ${APP_NAME}` }

async function Me() {
  const user = await requireUser()
  return <MePanel user={{ id: user.id, fullName: user.fullName, email: user.email, username: user.username, rolesLabel: formatRoles(user.roles) }} />
}

export default function MePage() {
  return (
    <div className="mx-auto w-full max-w-lg">
      <Suspense fallback={<MePanelSkeleton />}>
        <Me />
      </Suspense>
    </div>
  )
}

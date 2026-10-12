import { Suspense } from "react"

import { RequirementsLoader } from "./requirements-loader"
import { RequirementsSkeleton } from "./requirements-skeleton"
import { RequirementsView } from "./requirements-view"

/**
 * Project › Table view. Everything here depends on the session and the project, so it all
 * streams behind a skeleton shaped like the toolbar and grid; the page header above it is
 * rendered by the project layout.
 */
export function RequirementsTablePage({ params }: { params: Promise<{ code: string }> }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Suspense fallback={<RequirementsSkeleton />}>
        <RequirementsLoader params={params} view={RequirementsView} />
      </Suspense>
    </div>
  )
}

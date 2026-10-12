import { Suspense } from "react"

import { BoardSkeleton } from "./board-skeleton"
import { BoardView } from "./board-view"
import { RequirementsLoader } from "./requirements-loader"

/**
 * Project › Board view. Like the table, it all depends on the session and the project, so it
 * streams behind a skeleton shaped like the toolbar and columns; the layout renders the header.
 */
export function RequirementsBoardPage({ params }: { params: Promise<{ code: string }> }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Suspense fallback={<BoardSkeleton />}>
        <RequirementsLoader params={params} view={BoardView} />
      </Suspense>
    </div>
  )
}

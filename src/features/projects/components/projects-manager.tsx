"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"

import { useQueryFlag } from "@/hooks/use-query-flag"
import { SearchParam } from "@/lib/routes"

import { setProjectArchivedAction } from "../actions/project-actions"
import type { AdminProjectRow, MemberOption } from "../types/project"
import { ArchiveProjectDialog } from "./archive-project-dialog"
import { ProjectFormDialog } from "./project-form-dialog"
import { ProjectsTable } from "./projects-table"

type RowDialog = { kind: "edit" | "archive"; project: AdminProjectRow } | null

/**
 * Owns which admin project dialog is open and renders the table. The New project dialog is
 * driven by the `?new=1` URL flag (header button and switcher link); row dialogs are local.
 */
export function ProjectsManager({ rows, memberOptions }: { rows: AdminProjectRow[]; memberOptions: MemberOption[] }) {
  const [creating, stopCreating] = useQueryFlag(SearchParam.New)
  const [dialog, setDialog] = useState<RowDialog>(null)
  const [, startTransition] = useTransition()
  const archive = (project: AdminProjectRow) => setDialog({ kind: "archive", project })

  const restore = (project: AdminProjectRow) =>
    startTransition(async () => {
      const result = await setProjectArchivedAction(project.id, false)
      if (result.status === "error") toast.error(result.message)
      else toast.success(`${project.name} restored`)
    })

  return (
    <>
      <ProjectsTable rows={rows} onEdit={(project) => setDialog({ kind: "edit", project })} onArchive={archive} onRestore={restore} />
      {creating && <ProjectFormDialog memberOptions={memberOptions} onClose={stopCreating} />}
      {dialog?.kind === "edit" && (
        <ProjectFormDialog project={dialog.project} memberOptions={memberOptions} onClose={() => setDialog(null)} onArchive={archive} />
      )}
      {dialog?.kind === "archive" && <ArchiveProjectDialog project={dialog.project} onClose={() => setDialog(null)} />}
    </>
  )
}

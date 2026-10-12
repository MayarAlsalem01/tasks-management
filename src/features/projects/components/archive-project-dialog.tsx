"use client"

import { ArchiveIcon } from "lucide-react"
import { useTransition } from "react"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

import { setProjectArchivedAction } from "../actions/project-actions"
import type { AdminProjectRow } from "../types/project"

/** Confirmation before archiving: explains that the project becomes read-only but nothing is lost. */
export function ArchiveProjectDialog({ project, onClose }: { project: AdminProjectRow; onClose: () => void }) {
  const [pending, startTransition] = useTransition()

  const archive = () =>
    startTransition(async () => {
      const result = await setProjectArchivedAction(project.id, true)
      if (result.status === "error") {
        toast.error(result.message)
        return
      }
      toast.success(`${project.name} archived`)
      onClose()
    })

  return (
    <AlertDialog open onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="sm:max-w-120">
        <AlertDialogHeader className="flex-row items-start gap-3.5 text-left">
          <span className="flex size-9 flex-none items-center justify-center rounded-full bg-warning-bg text-warning-solid">
            <ArchiveIcon className="size-4.5" />
          </span>
          <div className="flex flex-col gap-2">
            <AlertDialogTitle>Archive {project.name}?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-700">
              The project becomes read-only and leaves members&apos; project switchers. {project.frCount} FRs,
              their ACs, comments and audit history are kept and stay viewable under Archived.
            </AlertDialogDescription>
            <p className="text-caption text-gray-600">
              {project.team.length} members will lose it from their lists. You can restore it at any time.
            </p>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className="border-warning-border bg-warning-subtle">
          <AlertDialogCancel variant="ghost" disabled={pending}>Cancel</AlertDialogCancel>
          <Button variant="warning" onClick={archive} loading={pending} disabled={pending}>
            Archive project
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

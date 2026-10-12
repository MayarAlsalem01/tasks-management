"use client"

import { Trash2Icon } from "lucide-react"
import { useState, useTransition } from "react"
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
import { TextField } from "@/components/ui/form-field"

import { deleteActivityAction, deleteStepAction, renameActivityAction, renameStepAction } from "../actions/requirement-actions"
import { StructureKind, type StructureNode } from "../types/structure"
import { deletionSummary } from "../utils/structure"
import { DialogShell, useDialogAction } from "./create-structure-dialogs"

const RENAME = {
  [StructureKind.Activity]: { action: renameActivityAction, idField: "activityId" },
  [StructureKind.Step]: { action: renameStepAction, idField: "stepId" },
}

const DELETE = {
  [StructureKind.Activity]: (id: string) => deleteActivityAction({ activityId: id }),
  [StructureKind.Step]: (id: string) => deleteStepAction({ stepId: id }),
}

/** Fixes the name of an activity or step. Admin/PO only. */
export function RenameStructureDialog({ node, onClose }: { node: StructureNode; onClose: () => void }) {
  const { action, idField } = RENAME[node.kind]
  const [name, setName] = useState(node.name)
  const [state, formAction, pending] = useDialogAction(action, (s) => {
    toast.success(s.message)
    onClose()
  })
  const error = state.fieldErrors?.name ?? (state.status === "error" ? state.message : undefined)
  return (
    <DialogShell title={`Rename ${node.kind}`} description={`Requirements under “${node.name}” keep their codes and history.`} formId="rename-form" submitLabel="Save name" pending={pending} onClose={onClose}>
      <form id="rename-form" action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name={idField} value={node.id} />
        <TextField id="rename-name" name="name" label="Name" autoFocus value={name} onChange={(e) => setName(e.target.value)} error={error} />
      </form>
    </DialogShell>
  )
}

/**
 * Confirms deleting an activity or step together with everything under it (soft delete,
 * FR-PRJ-003). `onDeleted` runs after the server confirms, e.g. to leave a deleted step's view.
 */
export function DeleteStructureDialog({ node, onDeleted, onClose }: { node: StructureNode; onDeleted: () => void; onClose: () => void }) {
  const [pending, startTransition] = useTransition()
  const remove = () =>
    startTransition(async () => {
      const result = await DELETE[node.kind](node.id)
      if (result.status === "error") {
        toast.error(result.message)
        return
      }
      toast.success(result.message)
      onDeleted()
      onClose()
    })

  return (
    <AlertDialog open onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="sm:max-w-110">
        <AlertDialogHeader className="flex-row items-start gap-3.5 text-left">
          <span className="flex size-9 flex-none items-center justify-center rounded-full bg-danger-bg text-danger-fg">
            <Trash2Icon className="size-4.5" />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <AlertDialogTitle className="break-words">Delete “{node.name}”?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-700">
              {deletionSummary(node)} This can&apos;t be undone from the app, and the FR codes won&apos;t be reused.
            </AlertDialogDescription>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel variant="ghost" disabled={pending}>Cancel</AlertDialogCancel>
          <Button variant="destructive" onClick={remove} loading={pending} disabled={pending}>Delete {node.kind}</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

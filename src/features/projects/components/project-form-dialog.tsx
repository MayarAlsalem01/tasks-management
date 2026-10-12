"use client"

import { useActionState, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { idleState, type ActionState } from "@/lib/action-state"

import { createProjectAction, updateProjectAction } from "../actions/project-actions"
import type { AdminProjectRow, MemberOption } from "../types/project"
import { MemberPicker } from "./member-picker"

type ProjectFormDialogProps = {
  /** The project being edited; omit to create a new one. */
  project?: AdminProjectRow
  memberOptions: MemberOption[]
  onClose: () => void
  onArchive?: (project: AdminProjectRow) => void
}

function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-caption text-danger-fg">{message}</p> : null
}

/** New / Edit project dialog: name, key (create only), description and members. */
export function ProjectFormDialog({ project, memberOptions, onClose, onArchive }: ProjectFormDialogProps) {
  const [code, setCode] = useState(project?.code ?? "")
  const [memberIds, setMemberIds] = useState(project?.memberIds ?? [])
  const readOnly = project?.archived ?? false

  const [state, formAction, pending] = useActionState(async (prev: ActionState, formData: FormData) => {
    const result = project ? await updateProjectAction(project.id, prev, formData) : await createProjectAction(prev, formData)
    if (result.status === "success") {
      toast.success(result.message)
      onClose()
    }
    return result
  }, idleState)
  const errors = state.fieldErrors ?? {}

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[calc(100svh-2rem)] overflow-y-auto sm:max-w-140">
        <DialogHeader>
          <DialogTitle>{project ? (readOnly ? project.name : "Edit project") : "New project"}</DialogTitle>
          <DialogDescription>
            {project ? `${project.code} · changes are recorded in the audit log.` : "Create a project, then add activities, steps and FRs."}
          </DialogDescription>
        </DialogHeader>

        <form id="project-form" action={formAction} className="flex flex-col gap-4">
          <fieldset disabled={readOnly} className="contents">
            <div className="grid grid-cols-[1fr_130px] gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="project-name" className="text-caption text-gray-700">Project name</Label>
                <Input id="project-name" name="name" defaultValue={project?.name} placeholder="e.g. Partner API" aria-invalid={!!errors.name || undefined} />
                <FieldError message={errors.name} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="project-code" className="text-caption text-gray-700">Key</Label>
                {project ? (
                  <span className="flex h-8 items-center font-mono text-ui">{project.code}</span>
                ) : (
                  <Input id="project-code" name="code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="PAPI" maxLength={5} className="font-mono uppercase" aria-invalid={!!errors.code || undefined} />
                )}
                <FieldError message={errors.code} />
              </div>
            </div>
            {!project && (
              <p className="-mt-2 text-caption text-gray-600">
                The key forms FR IDs, e.g. FR-{code || "KEY"}-001, and can&apos;t be changed later.
              </p>
            )}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="project-description" className="text-caption text-gray-700">
                Description <span className="font-normal text-gray-500">(optional)</span>
              </Label>
              <Textarea id="project-description" name="description" rows={2} defaultValue={project?.description ?? ""} placeholder="What this project covers" className="resize-none" />
              <FieldError message={errors.description} />
            </div>
            <MemberPicker options={memberOptions} value={memberIds} onChange={setMemberIds} />
          </fieldset>
          {state.status === "error" && !state.fieldErrors && <p className="text-caption text-danger-fg">{state.message}</p>}
        </form>

        <DialogFooter className="sm:justify-between">
          {project && !readOnly && onArchive ? (
            <Button variant="ghost" className="text-warning-fg hover:bg-warning-bg" onClick={() => onArchive(project)}>
              Archive project…
            </Button>
          ) : <span />}
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>{readOnly ? "Close" : "Cancel"}</Button>
            {!readOnly && (
              <Button type="submit" form="project-form" loading={pending} disabled={pending}>
                {project ? "Save changes" : "Create project"}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import type * as React from "react"
import { useActionState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FormField, TextField } from "@/components/ui/form-field"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ProjectNavActivity } from "@/features/projects"
import { idleState, type ActionState } from "@/lib/action-state"

import { createActivityAction, createStepAction } from "../actions/requirement-actions"

type Action = (prev: ActionState, formData: FormData) => Promise<ActionState>

/** `useActionState` that toasts and closes on success; the dialog renders errors from state. */
export function useDialogAction(action: Action, onDone: (state: ActionState) => void) {
  return useActionState(async (prev: ActionState, formData: FormData) => {
    const result = await action(prev, formData)
    if (result.status === "success") onDone(result)
    return result
  }, idleState)
}

function DialogShell({ title, description, formId, submitLabel, pending, onClose, children }: { title: string; description: string; formId: string; submitLabel: string; pending: boolean; onClose: () => void; children: React.ReactNode }) {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-110">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {children}
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" form={formId} loading={pending} disabled={pending}>{submitLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/** New activity (a top-level journey stage, FR-PRJ-002). Admin/PO only. */
export function CreateActivityDialog({ projectId, onClose }: { projectId: string; onClose: () => void }) {
  const [state, formAction, pending] = useDialogAction(createActivityAction, (s) => {
    toast.success(s.message)
    onClose()
  })
  return (
    <DialogShell title="New activity" description="A top-level stage of the user journey, e.g. “Checkout”. Break it into steps next." formId="activity-form" submitLabel="Create activity" pending={pending} onClose={onClose}>
      <form id="activity-form" action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="projectId" value={projectId} />
        <TextField id="activity-name" name="name" label="Name" autoFocus placeholder="e.g. Checkout" error={state.fieldErrors?.name ?? (state.status === "error" ? state.message : undefined)} />
      </form>
    </DialogShell>
  )
}

/** New step under an activity (FR-PRJ-002). Admin/PO only. */
export function CreateStepDialog({ activities, activityId, onClose }: { activities: ProjectNavActivity[]; activityId?: string; onClose: () => void }) {
  const [state, formAction, pending] = useDialogAction(createStepAction, (s) => {
    toast.success(s.message)
    onClose()
  })
  const errors = state.fieldErrors ?? {}
  return (
    <DialogShell title="New step" description="A step inside an activity, e.g. “Card payment”. FRs live under steps." formId="step-form" submitLabel="Create step" pending={pending} onClose={onClose}>
      <form id="step-form" action={formAction} className="flex flex-col gap-4">
        <FormField id="step-activity" label="Activity" error={errors.activityId}>
          <Select name="activityId" defaultValue={activityId ?? activities[0]?.id}>
            <SelectTrigger id="step-activity" className="w-full"><SelectValue placeholder="Pick an activity" /></SelectTrigger>
            <SelectContent>
              {activities.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </FormField>
        <TextField id="step-name" name="name" label="Name" autoFocus placeholder="e.g. Card payment" error={errors.name ?? (state.status === "error" && !state.fieldErrors ? state.message : undefined)} />
      </form>
    </DialogShell>
  )
}

export { DialogShell }

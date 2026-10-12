"use client"

import { useState } from "react"
import { toast } from "sonner"

import { FormField, TextField } from "@/components/ui/form-field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { ProjectNav } from "@/features/projects"
import { Role } from "@/lib/auth/roles"

import { createFrAction } from "../actions/requirement-actions"
import type { ProjectPerson } from "../types/requirement"
import type { AssignmentRole } from "../types/schemas"
import { Priority, PRIORITY_LABEL, SPEC_STATUS_LABEL, SpecStatus } from "../types/status"
import { formatFrCode, nextSequence } from "../utils/codes"
import { DialogShell, useDialogAction } from "./create-structure-dialogs"
import { AssigneeSummary, MenuTrigger } from "./menu-trigger"
import { PeoplePicker } from "./people-picker"

function OptionSelect({ id, name, labels, defaultValue }: { id: string; name: string; labels: Record<string, string>; defaultValue: string }) {
  return (
    <Select name={name} defaultValue={defaultValue}>
      <SelectTrigger id={id} className="w-full"><SelectValue /></SelectTrigger>
      <SelectContent>{Object.entries(labels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent>
    </Select>
  )
}

function AssigneeField({ role, label, people, value, onChange }: { role: AssignmentRole; label: string; people: ProjectPerson[]; value: string[]; onChange: (ids: string[]) => void }) {
  const eligible = people.filter((p) => p.roles.includes(role))
  const name = role === Role.Developer ? "developerIds" : "qaIds"
  return (
    <FormField id={name} label={label} optional>
      <PeoplePicker title={label} people={eligible} value={value} onChange={onChange}>
        <MenuTrigger id={name} variant="field" className="max-w-none"><AssigneeSummary people={eligible.filter((p) => value.includes(p.id))} full /></MenuTrigger>
      </PeoplePicker>
      {value.map((id) => <input key={id} type="hidden" name={name} value={id} />)}
    </FormField>
  )
}

type CreateFrDialogProps = {
  project: ProjectNav
  people: ProjectPerson[]
  /** Every FR code in the project (archived too), for the code preview. */
  existingCodes: string[]
  stepId?: string
  onCreated: (code: string) => void
  onClose: () => void
}

/** New FR under a step, with priority, spec, assignees and target date. Admin/PO only. */
export function CreateFrDialog({ project, people, existingCodes, stepId, onCreated, onClose }: CreateFrDialogProps) {
  const [developerIds, setDeveloperIds] = useState<string[]>([])
  const [qaIds, setQaIds] = useState<string[]>([])
  const [state, formAction, pending] = useDialogAction(createFrAction, (s) => {
    toast.success(`${s.message} created. Add its acceptance criteria next.`)
    onCreated(s.message ?? "")
  })
  const errors = state.fieldErrors ?? {}
  const code = formatFrCode(project.code, nextSequence(existingCodes))
  const activities = project.activities.filter((a) => a.steps.length > 0)

  return (
    <DialogShell title="New functional requirement" description={`It will be ${code}.`} formId="fr-form" submitLabel="Create FR" pending={pending} onClose={onClose}>
      <form id="fr-form" action={formAction} className="flex max-h-[60svh] flex-col gap-4 overflow-y-auto px-0.5">
        <FormField id="fr-step" label="Step" error={errors.stepId}>
          <Select name="stepId" defaultValue={stepId}>
            <SelectTrigger id="fr-step" className="w-full"><SelectValue placeholder="Pick a step" /></SelectTrigger>
            {/* Popper, not the default item-aligned: with no step picked yet (or no steps at all)
                there's no item to align to, and Radix leaves the menu at the top-left corner. */}
            <SelectContent position="popper" align="start">
              {activities.map((a) => (
                <SelectGroup key={a.id}>
                  <SelectLabel>{a.name}</SelectLabel>
                  {a.steps.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectGroup>
              ))}
              {!activities.length && <p className="px-2 py-1.5 text-caption text-gray-600">No steps yet. Add a step to an activity first.</p>}
            </SelectContent>
          </Select>
        </FormField>
        <TextField id="fr-title" name="title" label="Requirement" placeholder="e.g. Tokenize card details via the vault service" error={errors.title} />
        <FormField id="fr-description" label="What it must do" optional error={errors.description}>
          <Textarea id="fr-description" name="description" rows={3} className="resize-none" />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField id="fr-priority" label="Priority"><OptionSelect id="fr-priority" name="priority" labels={PRIORITY_LABEL} defaultValue={Priority.Medium} /></FormField>
          <FormField id="fr-spec" label="Spec status"><OptionSelect id="fr-spec" name="spec" labels={SPEC_STATUS_LABEL} defaultValue={SpecStatus.Draft} /></FormField>
        </div>
        <AssigneeField role={Role.Developer} label="Developers" people={people} value={developerIds} onChange={setDeveloperIds} />
        {errors.developerIds && <p className="-mt-3 text-caption text-danger-fg">{errors.developerIds}</p>}
        <AssigneeField role={Role.Qa} label="QA engineers" people={people} value={qaIds} onChange={setQaIds} />
        {errors.qaIds && <p className="-mt-3 text-caption text-danger-fg">{errors.qaIds}</p>}
        <FormField id="fr-target" label="Target date" optional error={errors.targetDate}>
          <Input id="fr-target" name="targetDate" type="date" className="w-45 font-mono" />
        </FormField>
        {state.status === "error" && !state.fieldErrors && <p className="text-caption text-danger-fg">{state.message}</p>}
      </form>
    </DialogShell>
  )
}

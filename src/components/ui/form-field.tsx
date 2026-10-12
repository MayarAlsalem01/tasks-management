import type * as React from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type FormFieldProps = {
  id: string
  label: string
  error?: string
  optional?: boolean
  children: React.ReactNode
}

/** Label, any control and its inline error, in the dialogs' stacked form layout. */
function FormField({ id, label, error, optional, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="text-caption text-gray-700">
        {label} {optional && <span className="font-normal text-gray-500">(optional)</span>}
      </Label>
      {children}
      {error && <p className="text-caption text-danger-fg">{error}</p>}
    </div>
  )
}

/** `FormField` around a text `Input`; marks the input invalid when there's an error. */
function TextField({ id, label, error, optional, ...input }: React.ComponentProps<typeof Input> & Omit<FormFieldProps, "children">) {
  return (
    <FormField id={id} label={label} error={error} optional={optional}>
      <Input id={id} aria-invalid={!!error || undefined} {...input} />
    </FormField>
  )
}

export { FormField, TextField }

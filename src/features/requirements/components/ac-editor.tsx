"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import type { AcTextInput } from "../types/schemas"

const CLAUSES = [
  { key: "given", label: "Given", placeholder: "Given…" },
  { key: "when", label: "When", placeholder: "When…" },
  { key: "then", label: "Then", placeholder: "Then…" },
] as const

/** Given / When / Then inputs for adding or rewriting an acceptance criterion (Admin/PO). */
export function AcEditor({ initial, onCancel, onSave }: { initial?: AcTextInput; onCancel: () => void; onSave: (text: AcTextInput) => Promise<boolean> }) {
  const [text, setText] = useState<AcTextInput>(initial ?? { given: "", when: "", then: "" })
  const [saving, setSaving] = useState(false)
  const complete = CLAUSES.every(({ key }) => text[key].trim())

  const save = async () => {
    setSaving(true)
    const ok = await onSave(text)
    setSaving(false)
    if (ok) onCancel()
  }

  return (
    <div className="flex flex-col gap-1.5">
      {CLAUSES.map(({ key, label, placeholder }) => (
        <Input
          key={key}
          aria-label={label}
          placeholder={placeholder}
          value={text[key]}
          autoFocus={key === "given"}
          onChange={(e) => setText((t) => ({ ...t, [key]: e.target.value }))}
          className="bg-white"
        />
      ))}
      <span className="flex justify-end gap-1.5">
        <Button variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
        <Button size="sm" disabled={!complete || saving} onClick={save}>Save</Button>
      </span>
    </div>
  )
}

"use client"

import { cn } from "cn"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

type InlineTextProps = {
  value: string
  onSave: (value: string) => void
  label: string
  placeholder?: string
  multiline?: boolean
  rows?: number
  className?: string
}

/**
 * A text field that saves when it loses focus, only if the trimmed value changed. Remounts
 * (via `key`) when the saved value changes elsewhere, so it never shows stale text.
 */
export function InlineText({ value, onSave, label, placeholder, multiline = false, rows = 2, className }: InlineTextProps) {
  const commit = (next: string) => {
    if (next.trim() !== value.trim()) onSave(next.trim())
  }
  const shared = { "aria-label": label, placeholder, defaultValue: value, className: cn("bg-white", className) }
  return multiline ? (
    <Textarea key={value} rows={rows} {...shared} onBlur={(e) => commit(e.target.value)} className={cn("resize-none", shared.className)} />
  ) : (
    <Input key={value} {...shared} onBlur={(e) => commit(e.target.value)} onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()} />
  )
}

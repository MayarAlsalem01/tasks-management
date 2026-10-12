"use client"

import { cn } from "cn"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

/** Option value meaning "no filter" (Radix Select can't use an empty value). */
export const FILTER_ALL = "all"

type FilterSelectProps = {
  label: string
  value: string | undefined
  onChange: (value: string | undefined) => void
  /** Include a `FILTER_ALL` option for "no filter". */
  options: { value: string; label: string }[]
  /** Hide the visible label (it stays as the accessible name) when the "all" option names the filter. */
  hideLabel?: boolean
  className?: string
}

/** A toolbar filter backed by the URL: `undefined` means no filter. */
export function FilterSelect({ label, value, onChange, options, hideLabel = false, className }: FilterSelectProps) {
  return (
    <label className="flex items-center gap-1.5 text-caption text-gray-600">
      {!hideLabel && label}
      <Select value={value ?? FILTER_ALL} onValueChange={(v) => onChange(v === FILTER_ALL ? undefined : v)}>
        <SelectTrigger aria-label={label} className={cn("h-8 min-w-32 bg-white", className)}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  )
}

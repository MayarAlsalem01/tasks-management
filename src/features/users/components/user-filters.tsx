"use client"

import { SearchIcon } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useTransition } from "react"

import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ROLE_LABELS, ROLES } from "@/lib/auth/roles"

import type { ProjectOption, UserFilters } from "../types/user"

const ALL = "all"

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string | undefined
  onChange: (value: string | undefined) => void
  options: { value: string; label: string }[]
}) {
  return (
    <label className="flex items-center gap-1.5 text-caption text-gray-600">
      {label}
      <Select value={value ?? ALL} onValueChange={(v) => onChange(v === ALL ? undefined : v)}>
        <SelectTrigger className="h-8 min-w-32 bg-white">
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

/** Search box and Role / Project / Status filters for the Users table, kept in the URL. */
export function UserFiltersBar({ filters, projects }: { filters: UserFilters; projects: ProjectOption[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const update = (key: keyof UserFilters, value: string | undefined) => {
    const params = new URLSearchParams(searchParams)
    if (value) params.set(key, value)
    else params.delete(key)
    startTransition(() => router.replace(`${pathname}?${params}`, { scroll: false }))
  }
  const hasFilters = !!(filters.q || filters.role || filters.project || filters.status)

  return (
    <div className="flex flex-wrap items-center gap-2 pb-3">
      <InputGroup className="h-8 w-full bg-white sm:w-60">
        <InputGroupAddon><SearchIcon /></InputGroupAddon>
        <InputGroupInput
          type="search"
          aria-label="Search users"
          placeholder="Name, username or email"
          defaultValue={filters.q}
          onChange={(e) => update("q", e.target.value.trim() || undefined)}
        />
      </InputGroup>
      <FilterSelect
        label="Role"
        value={filters.role}
        onChange={(v) => update("role", v)}
        options={[{ value: ALL, label: "All roles" }, ...ROLES.map((r) => ({ value: r, label: ROLE_LABELS[r] }))]}
      />
      <FilterSelect
        label="Project"
        value={filters.project}
        onChange={(v) => update("project", v)}
        options={[{ value: ALL, label: "All projects" }, ...projects.map((p) => ({ value: p.code, label: `${p.code} · ${p.name}` }))]}
      />
      <FilterSelect
        label="Status"
        value={filters.status}
        onChange={(v) => update("status", v)}
        options={[
          { value: ALL, label: "All statuses" },
          { value: "active", label: "Active" },
          { value: "deactivated", label: "Deactivated" },
        ]}
      />
      {hasFilters && (
        <Button variant="link" className="px-2!" onClick={() => startTransition(() => router.replace(pathname))}>
          Clear filters
        </Button>
      )}
    </div>
  )
}

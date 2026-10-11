"use client"

import { cn } from "cn"

import { Checkbox } from "@/components/ui/checkbox"

import type { ProjectOption } from "../types/user"

/**
 * Project memberships for the user form, submitted as `projectIds`. Disabled and all checked
 * for Admin/PO, who can access every project.
 */
export function ProjectChecklist({
  projects,
  value,
  onChange,
  allAccess,
  error,
}: {
  projects: ProjectOption[]
  value: string[]
  onChange: (ids: string[]) => void
  allAccess: boolean
  error?: string
}) {
  const toggle = (id: string) => onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id])

  return (
    <fieldset className="flex flex-col gap-1.5" disabled={allAccess}>
      <legend className="mb-1.5 text-caption font-medium text-gray-700">
        Projects{" "}
        <span className="font-normal text-gray-500">
          · {allAccess ? "Admins and Product Owners can access all projects" : `${value.length} selected`}
        </span>
      </legend>
      <div className={cn("overflow-hidden rounded-lg border", error ? "border-danger-solid" : "border-gray-200", allAccess && "opacity-55")}>
        {projects.length === 0 && <p className="px-3 py-2.5 text-ui text-gray-600">No active projects yet.</p>}
        {projects.map((project) => (
          <label key={project.id} className="flex h-9 cursor-pointer items-center gap-2.5 border-b border-gray-75 px-3 text-ui last:border-b-0 hover:bg-gray-25">
            <Checkbox
              name={allAccess ? undefined : "projectIds"}
              value={project.id}
              checked={allAccess || value.includes(project.id)}
              onCheckedChange={() => toggle(project.id)}
            />
            <span className="w-11 font-mono text-overline text-gray-600">{project.code}</span>
            <span className="flex-1">{project.name}</span>
          </label>
        ))}
      </div>
      {error && <p className="text-caption text-danger-fg">{error}</p>}
    </fieldset>
  )
}

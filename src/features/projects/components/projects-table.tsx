"use client"

import { Button } from "@/components/ui/button"
import { UserAvatar } from "@/components/ui/user-avatar"

import type { AdminProjectRow } from "../types/project"
import { ProjectBadge } from "./project-badge"
import { PROJECTS_GRID } from "../utils/table-layout"

function ProgressBar({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <span className="flex items-center gap-2 text-overline text-gray-700">
      <span className="w-7 text-gray-600">{label}</span>
      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
        <span className={`block h-1.5 ${tone}`} style={{ width: `${value}%` }} />
      </span>
      <span className="w-8 text-right font-mono">{value}%</span>
    </span>
  )
}


type ProjectsTableProps = {
  rows: AdminProjectRow[]
  onEdit: (row: AdminProjectRow) => void
  onArchive: (row: AdminProjectRow) => void
  onRestore: (row: AdminProjectRow) => void
}

/** Admin Projects table: key, team, Dev/QA progress, FR count and row actions. */
export function ProjectsTable({ rows, onEdit, onArchive, onRestore }: ProjectsTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-150">
      <div className="min-w-[900px]">
        <div style={{ gridTemplateColumns: PROJECTS_GRID }} className={`grid items-center gap-4 h-9 border-b border-gray-150 bg-gray-25 px-4 text-caption font-medium text-gray-600`}>
          <span>Project</span><span>Members</span><span>Team</span><span>Progress</span><span>FRs</span><span />
        </div>
        {rows.map((row) => (
          <div key={row.id} style={{ gridTemplateColumns: PROJECTS_GRID }} className={`grid items-center gap-4 min-h-15 border-b border-gray-75 px-4 py-2 last:border-b-0 ${row.archived ? "bg-gray-25/60 opacity-85" : ""}`}>
            <span className="flex min-w-0 items-center gap-2.5">
              <ProjectBadge code={row.code} archived={row.archived} size="lg" />
              <span className="flex min-w-0 flex-col">
                <span className="text-ui font-medium">{row.name}</span>
                <span className="truncate text-caption text-gray-600">{row.description || "No description"}</span>
              </span>
            </span>
            <span className="font-mono text-caption text-gray-700">{row.team.length}</span>
            <span className="flex -space-x-1.5">
              {row.team.slice(0, 4).map((member) => (
                <UserAvatar key={member.id} userId={member.id} name={member.fullName} size="sm" className="ring-2 ring-white" />
              ))}
            </span>
            <span className="flex flex-col gap-1.5 pr-2">
              <ProgressBar label="Dev" value={row.devDonePct} tone="bg-cobalt-500" />
              <ProgressBar label="QA" value={row.qaPassedPct} tone="bg-success-solid" />
            </span>
            <span className="font-mono text-caption text-gray-700">{row.frCount}</span>
            <span className="flex justify-end gap-0.5">
              <Button variant="ghost" size="sm" onClick={() => onEdit(row)}>
                {row.archived ? "View" : "Edit / members"}
              </Button>
              {row.archived ? (
                <Button variant="ghost" size="sm" className="text-cobalt-600" onClick={() => onRestore(row)}>
                  Restore
                </Button>
              ) : (
                <Button variant="ghost" size="sm" className="text-warning-fg" onClick={() => onArchive(row)}>
                  Archive
                </Button>
              )}
            </span>
          </div>
        ))}
        {rows.length === 0 && (
          <p className="px-6 py-10 text-center text-ui text-gray-600">
            No projects here yet.
          </p>
        )}
      </div>
    </div>
  )
}

"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Role } from "@/lib/auth/roles"

import { setAssigneesAction } from "../actions/requirement-actions"
import type { RunMutation } from "../hooks/use-fr-mutations"
import type { UnassignedFr } from "../types/my-tasks"
import type { Person, ProjectPerson } from "../types/requirement"
import type { AssignmentRole } from "../types/schemas"
import { formatIsoDate } from "../utils/dates"
import { PriorityLabel } from "./status-pills"

const ROLE_COPY = {
  [Role.Developer]: { placeholder: "Assign developer…", label: "Dev", done: "developer" },
  [Role.Qa]: { placeholder: "Assign QA…", label: "QA", done: "QA engineer" },
} as const

type AssignCellProps = { fr: UnassignedFr; role: AssignmentRole; assigned: Person[]; people: ProjectPerson[]; run: RunMutation }

function AssignCell({ fr, role, assigned, people, run }: AssignCellProps) {
  const copy = ROLE_COPY[role]
  if (assigned.length) return <span className="truncate text-caption text-gray-700">{copy.label}: {assigned.map((p) => p.fullName).join(", ")}</span>
  const options = people.filter((p) => p.roles.includes(role))
  const assign = (userId: string) => {
    const name = options.find((p) => p.id === userId)?.fullName
    void run(fr.id, () => setAssigneesAction({ frId: fr.id, role, userIds: [userId] }), { success: `${fr.code} ${copy.done} set to ${name}` })
  }
  return (
    <Select onValueChange={assign} disabled={!options.length}>
      <SelectTrigger aria-label={copy.placeholder} className="h-[30px] w-full bg-white text-caption">
        <SelectValue placeholder={options.length ? copy.placeholder : `No ${copy.done} in project`} />
      </SelectTrigger>
      <SelectContent>
        {options.map((p) => <SelectItem key={p.id} value={p.id}>{p.fullName}</SelectItem>)}
      </SelectContent>
    </Select>
  )
}

/**
 * Admin/PO panel of FRs missing a developer or QA engineer, with pickers limited to that FR's
 * project people holding the role. An FR leaves the list once both are set.
 */
export function UnassignedFrs({ frs, peopleByProject, run }: { frs: UnassignedFr[]; peopleByProject: Record<string, ProjectPerson[]>; run: RunMutation }) {
  return (
    <section className="overflow-hidden rounded-xl border border-warning-border bg-warning-subtle">
      <div className="flex flex-wrap items-center gap-2 px-4 py-3">
        <h2 className="text-ui font-semibold">Unassigned FRs</h2>
        <span className="rounded-xs bg-warning-bg px-1.5 font-mono text-overline tracking-normal text-warning-strong">{frs.length}</span>
        <span className="text-caption text-warning-fg">Pick a developer or QA engineer; the FR leaves this list once both are set.</span>
      </div>
      <div className="overflow-x-auto">
        {frs.map((fr) => {
          const people = peopleByProject[fr.projectId] ?? []
          return (
            <div key={fr.id} className="grid min-w-[860px] grid-cols-[96px_minmax(0,1fr)_84px_76px_190px_190px] items-center gap-3 border-t border-warning-border/60 bg-white px-4 py-2">
              <span className="font-mono text-caption text-gray-700">{fr.code}</span>
              <span title={fr.title} className="truncate text-ui">{fr.title}</span>
              <PriorityLabel priority={fr.priority} className="text-caption" />
              <span className="font-mono text-caption text-gray-600">{fr.targetDate ? formatIsoDate(fr.targetDate) : "—"}</span>
              <AssignCell fr={fr} role={Role.Developer} assigned={fr.developers} people={people} run={run} />
              <AssignCell fr={fr} role={Role.Qa} assigned={fr.qaEngineers} people={people} run={run} />
            </div>
          )
        })}
      </div>
    </section>
  )
}

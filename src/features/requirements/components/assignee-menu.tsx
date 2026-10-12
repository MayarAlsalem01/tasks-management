"use client"

import type * as React from "react"

import { Role } from "@/lib/auth/roles"

import { setAssigneesAction } from "../actions/requirement-actions"
import type { FrRow } from "../types/requirement"
import type { AssignmentRole } from "../types/schemas"
import { useFr } from "./fr-context"
import { PeoplePicker } from "./people-picker"

const FIELD = { [Role.Developer]: "developers", [Role.Qa]: "qaEngineers" } as const
const TITLE = { [Role.Developer]: "Developers", [Role.Qa]: "QA engineers" } as const

/**
 * Multi-select of an FR's developers or QA engineers (Admin/PO). Lists active project people
 * holding the role, so an Admin who is also a Developer can assign themself. Each toggle
 * saves immediately (newly assigned people are notified).
 */
export function AssigneeMenu({ fr, role, trigger }: { fr: FrRow; role: AssignmentRole; trigger: React.ReactNode }) {
  const { people, run } = useFr()
  const field = FIELD[role]
  const eligible = people.filter((p) => p.roles.includes(role))
  // Keep deactivated or no-longer-eligible assignees selectable so they can be removed.
  const options = [...eligible, ...fr[field].filter((p) => !eligible.some((e) => e.id === p.id))]

  const save = (ids: string[]) => {
    const next = options.filter((p) => ids.includes(p.id))
    void run(fr.id, () => setAssigneesAction({ frId: fr.id, role, userIds: ids }), { patch: { fr: { [field]: next } } })
  }

  return (
    <PeoplePicker title={TITLE[role]} people={options} value={fr[field].map((p) => p.id)} onChange={save}>
      {trigger}
    </PeoplePicker>
  )
}

import type { Role } from "@/lib/auth/roles"

import type { DevStatus, Priority, PrState, QaStatus, SpecStatus } from "./status"

/** A user as shown on requirements: avatar, name, and whether they've been deactivated. */
export type Person = { id: string; fullName: string; deactivated: boolean }

/** Someone who can be assigned in a project (members plus admins), with their roles. */
export type ProjectPerson = Person & { roles: Role[] }

export type AcRow = {
  id: string
  code: string
  /** Given / When / Then; `null` for ACs imported as one sentence (see `text`). */
  given: string | null
  when: string | null
  then: string | null
  text: string
  devDone: boolean
  qaPassed: boolean
  /** QA reported a defect and it hasn't passed since. */
  qaFailed: boolean
}

/** One FR row of the project table, with everything the drawer's Details and AC tabs need. */
export type FrRow = {
  id: string
  code: string
  title: string
  description: string
  activityId: string
  activityName: string
  stepId: string
  stepName: string
  priority: Priority
  spec: SpecStatus
  dev: DevStatus
  qa: QaStatus
  developers: Person[]
  qaEngineers: Person[]
  /** `YYYY-MM-DD` */
  targetDate: string | null
  notes: string | null
  openIssues: string | null
  archived: boolean
  acs: AcRow[]
}

export type FrComment = {
  id: string
  author: Person
  body: string
  isDefect: boolean
  acCode: string | null
  createdAt: Date
}

export type FrPullRequest = { id: string; url: string; repo: string; number: number; state: PrState }

/** One changed field in an audit entry, already formatted for display. */
export type AuditChange = { field: string; from: string; to: string }

export type FrAuditEntry = {
  id: string
  actor: Person | null
  changes: AuditChange[]
  override: boolean
  reason: string | null
  createdAt: Date
}

/** The drawer's lazily loaded parts (Discussion and Audit log tabs). */
export type FrDetail = {
  comments: FrComment[]
  pullRequests: FrPullRequest[]
  audit: FrAuditEntry[]
}

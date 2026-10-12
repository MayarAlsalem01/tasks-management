/** How the project table groups FR rows. */
export const FrGroupBy = {
  Activity: "activity",
  Assignee: "assignee",
  Dev: "dev",
  None: "none",
} as const
export type FrGroupBy = (typeof FrGroupBy)[keyof typeof FrGroupBy]

export const GROUP_BY_LABEL: Record<FrGroupBy, string> = {
  activity: "Activity › Step",
  assignee: "Assignee",
  dev: "Dev status",
  none: "None",
}

/** How the board splits cards into swimlanes. */
export const BoardLanes = {
  Activity: "activity",
  None: "none",
} as const
export type BoardLanes = (typeof BoardLanes)[keyof typeof BoardLanes]

export const BOARD_LANES_LABEL: Record<BoardLanes, string> = {
  activity: "Activity",
  none: "None",
}

/** Optional table columns (ID and Requirement are always shown). */
export const FrColumn = {
  Priority: "priority",
  Spec: "spec",
  Assignee: "assignee",
  Dev: "dev",
  Qa: "qa",
  Acs: "acs",
  Target: "target",
  Notes: "notes",
} as const
export type FrColumn = (typeof FrColumn)[keyof typeof FrColumn]

export const COLUMN_LABEL: Record<FrColumn, string> = {
  priority: "Priority",
  spec: "Spec status",
  assignee: "Assignee",
  dev: "Dev status",
  qa: "QA status",
  acs: "Acceptance criteria",
  target: "Target date",
  notes: "Notes",
}

/** Short column headers for the table itself. */
export const COLUMN_HEADER: Record<FrColumn, string> = {
  priority: "Priority",
  spec: "Spec",
  assignee: "Assignee",
  dev: "Dev",
  qa: "QA",
  acs: "Acceptance criteria",
  target: "Target",
  notes: "Notes",
}

/** Tabs of the FR drawer. */
export const DrawerTab = {
  Details: "details",
  Acs: "acs",
  Discussion: "discussion",
  Audit: "audit",
} as const
export type DrawerTab = (typeof DrawerTab)[keyof typeof DrawerTab]

/** `SearchParam.Assignee` value for FRs without a developer. */
export const UNASSIGNED = "none"

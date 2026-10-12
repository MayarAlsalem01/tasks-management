/** Every app path in one place, so links, redirects and the proxy never drift apart. */

export const ProjectView = {
  Table: "table",
  Board: "board",
  Dashboard: "dashboard",
} as const
export type ProjectView = (typeof ProjectView)[keyof typeof ProjectView]

/** Query-string keys the app reads. */
export const SearchParam = {
  /** Selected step in a project view. */
  Step: "step",
  /** Admin Projects tab. */
  Tab: "tab",
  /** Opens a "New …" dialog (`1` on admin pages; a `NewItem` on project pages). */
  New: "new",
  /** Parent of the item being created (activity id for a new step, step id for a new FR). */
  Parent: "parent",
  /** FR code whose drawer is open in a project view. */
  Fr: "fr",
  /** Drawer tab. */
  Panel: "panel",
  /** Free-text search. */
  Query: "q",
  Assignee: "assignee",
  Priority: "priority",
  Dev: "dev",
  Qa: "qa",
  Spec: "spec",
  /** Table grouping. */
  Group: "group",
  /** Board swimlanes. */
  Lanes: "lanes",
  /** `1` shows archived rows. */
  Archived: "archived",
} as const

/** Values of `SearchParam.New` on project pages. */
export const NewItem = { Activity: "activity", Step: "step", Fr: "fr" } as const
export type NewItem = (typeof NewItem)[keyof typeof NewItem]

export const AdminProjectsTab = { Active: "active", Archived: "archived" } as const
export type AdminProjectsTab = (typeof AdminProjectsTab)[keyof typeof AdminProjectsTab]

export const ROUTES = {
  home: "/",
  login: "/login",
  changePassword: "/change-password",
  myTasks: "/my-tasks",
  notifications: "/notifications",
  me: "/me",
  projects: "/projects",
  project: (code: string, view: ProjectView = ProjectView.Table) => `/projects/${code}/${view}`,
  admin: {
    users: "/admin/users",
    projects: "/admin/projects",
    audit: "/admin/audit",
  },
} as const

/** `path?key=value` without encoding surprises; skips empty values. */
export function withQuery(path: string, query: Record<string, string | undefined>) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) if (value) params.set(key, value)
  const qs = params.toString()
  return qs ? `${path}?${qs}` : path
}

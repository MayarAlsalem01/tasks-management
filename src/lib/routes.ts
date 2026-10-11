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
  /** Opens the "New …" dialog on admin pages. */
  New: "new",
} as const

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

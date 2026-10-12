import { ProjectView, ROUTES } from "@/lib/routes"

export const PROJECT_VIEWS: { view: ProjectView; label: string }[] = [
  { view: ProjectView.Table, label: "Table" },
  { view: ProjectView.Board, label: "Board" },
  { view: ProjectView.Dashboard, label: "Dashboard" },
]

const STATIC_TITLES: [prefix: string, title: string][] = [
  [ROUTES.myTasks, "My Tasks"],
  [ROUTES.notifications, "Notifications"],
  [ROUTES.me, "Me"],
  [ROUTES.admin.users, "Users"],
  [ROUTES.admin.projects, "Projects"],
  [ROUTES.admin.audit, "Audit log"],
  [ROUTES.projects, "Projects"],
]

const VIEWS = Object.values(ProjectView).join("|")
const PROJECT_PATH = new RegExp(`^${ROUTES.projects}/([^/]+)(?:/(${VIEWS}))?`)

/** The project code and view from a project page path (`ROUTES.project(...)`), if any. */
export function parseProjectPath(pathname: string): { code: string; view: ProjectView } | null {
  const match = PROJECT_PATH.exec(pathname)
  if (!match) return null
  return { code: decodeURIComponent(match[1]).toUpperCase(), view: (match[2] as ProjectView) ?? ProjectView.Table }
}

/** Title for the mobile top bar: the project's name on project pages, else the section name. */
export function pageTitle(pathname: string, projectName?: string) {
  if (parseProjectPath(pathname) && projectName) return projectName
  return STATIC_TITLES.find(([prefix]) => pathname.startsWith(prefix))?.[1] ?? "My Tasks"
}

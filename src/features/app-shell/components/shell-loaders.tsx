import { NotificationFeedLimit } from "@/features/notifications"
import { getNotificationFeed } from "@/features/notifications/server"
import { getAccessibleProjects, getArchivedProjectCount, getProjectNavs } from "@/features/projects/server"
import { formatRoles } from "@/lib/auth/roles"
import { requireUser } from "@/lib/auth/session"

import { HeaderActions } from "./app-header"
import { MobileTabBar, MobileTopBar } from "./mobile-bars"
import { Sidebar } from "./sidebar"

// Data loaders for the shell's streamed regions. Each reads the session (deduplicated per
// request) and cached queries, so it must render inside `<Suspense>`.

async function loadProjects() {
  const user = await requireUser()
  const projects = await getAccessibleProjects(user.id, user.isAdmin)
  return { user, projects, navs: await getProjectNavs(projects) }
}

export async function SidebarLoader() {
  const { user, projects, navs } = await loadProjects()
  const archivedCount = user.isAdmin ? await getArchivedProjectCount() : 0
  return (
    <Sidebar
      projects={projects}
      navs={navs}
      isAdmin={user.isAdmin}
      archivedCount={archivedCount}
      taskCount={projects.reduce((sum, p) => sum + p.mineCount, 0)}
    />
  )
}

export async function HeaderActionsLoader() {
  const user = await requireUser()
  const notifications = await getNotificationFeed(user.id, NotificationFeedLimit.Popover)
  return (
    <HeaderActions
      user={{ id: user.id, fullName: user.fullName, email: user.email, rolesLabel: formatRoles(user.roles) }}
      notifications={notifications}
    />
  )
}

export async function MobileTopBarLoader() {
  const { user, navs } = await loadProjects()
  const notifications = await getNotificationFeed(user.id, NotificationFeedLimit.Popover)
  return <MobileTopBar navs={navs} notifications={notifications} />
}

export async function MobileTabBarLoader() {
  const user = await requireUser()
  return <MobileTabBar notifications={await getNotificationFeed(user.id, NotificationFeedLimit.Popover)} />
}

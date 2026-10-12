import { Suspense } from "react"

import {
  AppShell,
  HeaderActionsLoader,
  HeaderActionsSkeleton,
  MobileTabBarLoader,
  MobileTabBarSkeleton,
  MobileTopBarLoader,
  MobileTopBarSkeleton,
  SidebarLoader,
  SidebarSkeleton,
} from "@/features/app-shell/server"
import { NotificationsLiveLoader } from "@/features/notifications/server"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell
      sidebar={<Suspense fallback={<SidebarSkeleton />}><SidebarLoader /></Suspense>}
      headerActions={<Suspense fallback={<HeaderActionsSkeleton />}><HeaderActionsLoader /></Suspense>}
      mobileTopBar={<Suspense fallback={<MobileTopBarSkeleton />}><MobileTopBarLoader /></Suspense>}
      mobileTabBar={<Suspense fallback={<MobileTabBarSkeleton />}><MobileTabBarLoader /></Suspense>}
    >
      {children}
      {/* Renders no UI, so it needs no skeleton. */}
      <Suspense fallback={null}><NotificationsLiveLoader /></Suspense>
    </AppShell>
  )
}

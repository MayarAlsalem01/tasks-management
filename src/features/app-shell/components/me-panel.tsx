import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { UserAvatar } from "@/components/ui/user-avatar"
import { signOut } from "@/features/auth"

import type { ShellUser } from "./user-menu"

/** The mobile "Me" tab: identity, roles and Sign out. */
export function MePanel({ user }: { user: ShellUser & { username: string } }) {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-3 rounded-xl border border-gray-150 bg-white p-4">
        <UserAvatar userId={user.id} name={user.fullName} size="lg" />
        <div className="flex min-w-0 flex-col">
          <span className="text-body font-semibold">{user.fullName}</span>
          <span className="truncate text-caption text-gray-600">{user.email}</span>
          <span className="font-mono text-caption text-gray-600">@{user.username}</span>
        </div>
      </div>
      <dl className="flex justify-between rounded-xl border border-gray-150 bg-white px-4 py-3 text-ui">
        <dt className="text-gray-600">Roles</dt>
        <dd className="font-medium">{user.rolesLabel}</dd>
      </dl>
      <form action={signOut}>
        <Button type="submit" variant="outline" className="h-12 w-full text-body">Sign out</Button>
      </form>
    </div>
  )
}

/** Me tab placeholder. */
export function MePanelSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4" aria-busy="true">
      <div className="flex items-center gap-3 rounded-xl border border-gray-150 p-4">
        <Skeleton className="size-10 rounded-full bg-gray-100" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-32 bg-gray-100" />
          <Skeleton className="h-2.5 w-44 bg-gray-75" />
        </div>
      </div>
      <Skeleton className="h-11 rounded-xl bg-gray-75" />
    </div>
  )
}

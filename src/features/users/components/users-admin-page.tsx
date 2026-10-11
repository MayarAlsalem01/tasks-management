import { PlusIcon } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"

import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/ui/page-header"
import { requireAdminPage } from "@/lib/auth/session"
import { ROUTES, SearchParam, withQuery } from "@/lib/routes"

import { getProjectOptions, getUserCounts, getUsers } from "../cache/queries"
import { parseUserFilters } from "../utils/filters"
import { UserFiltersBar } from "./user-filters"
import { UsersManager } from "./users-manager"
import { UsersSkeleton } from "./users-skeleton"

type SearchParams = Promise<Record<string, string | string[] | undefined>>

async function UserCounts() {
  await requireAdminPage()
  const counts = await getUserCounts()
  return `${counts.active} active · ${counts.deactivated} deactivated`
}

async function UsersContent({ searchParams }: { searchParams: SearchParams }) {
  await requireAdminPage()
  const params = await searchParams
  const filters = parseUserFilters(params)
  const [rows, projects] = await Promise.all([getUsers(filters), getProjectOptions()])
  return (
    <>
      <UserFiltersBar filters={filters} projects={projects} />
      <UsersManager rows={rows} projects={projects} filtered={Object.values(filters).some(Boolean)} />
    </>
  )
}

/**
 * Admin › Users. The header is part of the static shell; counts and the table stream in
 * behind skeletons. Every data part checks admin access itself (`requireAdminPage`).
 */
export function UsersAdminPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        breadcrumb={[{ label: "Admin" }, { label: "Users" }]}
        title="Users"
        meta={
          <Suspense fallback={<span className="inline-block h-2.5 w-36 animate-pulse rounded-xs bg-gray-100" />}>
            <UserCounts />
          </Suspense>
        }
        actions={
          <Button asChild>
            <Link href={withQuery(ROUTES.admin.users, { [SearchParam.New]: "1" })}><PlusIcon />New user</Link>
          </Button>
        }
      />
      <div className="flex min-h-0 flex-1 flex-col overflow-auto px-4 pt-3 pb-6 lg:px-6">
        <Suspense fallback={<UsersSkeleton />}>
          <UsersContent searchParams={searchParams} />
        </Suspense>
        <p className="pt-2.5 text-caption text-gray-600">
          Deactivated users stay listed and keep their place in assignments, comments and the audit log.
        </p>
      </div>
    </div>
  )
}

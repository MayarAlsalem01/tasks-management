import type { Metadata } from "next"

import { UsersAdminPage } from "@/features/users/server"
import { APP_NAME } from "@/lib/config"

export const metadata: Metadata = { title: `Users · ${APP_NAME}` }

export default function UsersPage({ searchParams }: PageProps<"/admin/users">) {
  return <UsersAdminPage searchParams={searchParams} />
}

"use client"

import type { UseQueryResult } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

import type { FrDetail, FrRow } from "../types/requirement"
import { DrawerTab } from "../types/table"
import type { FrPermissions } from "../utils/permissions"
import { FrAcsTab } from "./fr-acs-tab"
import { FrAuditTab } from "./fr-audit-tab"
import { FrDetailsTab } from "./fr-details-tab"
import { FrDiscussionTab } from "./fr-discussion-tab"

function DetailSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading" className="flex flex-col gap-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex gap-2.5">
          <Skeleton className="size-8 rounded-full bg-gray-75" />
          <div className="flex flex-1 flex-col gap-2"><Skeleton className="h-2.5 w-32 bg-gray-100" /><Skeleton className="h-2.5 w-4/5 bg-gray-75" /></div>
        </div>
      ))}
    </div>
  )
}

/** One drawer tab's content. Discussion and Audit wait for the lazily loaded FR detail. */
export function FrDetailPanel({ tab, fr, permissions, canArchive, detail }: { tab: DrawerTab; fr: FrRow; permissions: FrPermissions; canArchive: boolean; detail: UseQueryResult<FrDetail> }) {
  if (tab === DrawerTab.Details) return <FrDetailsTab fr={fr} permissions={permissions} canArchive={canArchive} />
  if (tab === DrawerTab.Acs) return <FrAcsTab fr={fr} permissions={permissions} comments={detail.data?.comments ?? []} />
  if (detail.isPending) return <DetailSkeleton />
  if (detail.isError) {
    return (
      <div role="alert" className="flex flex-col items-start gap-2 text-ui text-gray-700">
        {detail.error.message}
        <Button variant="outline" size="sm" onClick={() => void detail.refetch()}>Try again</Button>
      </div>
    )
  }
  return tab === DrawerTab.Discussion
    ? <FrDiscussionTab fr={fr} detail={detail.data} readOnly={fr.archived} />
    : <FrAuditTab entries={detail.data.audit} />
}

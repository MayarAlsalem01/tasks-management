import { ClockIcon, TriangleAlertIcon } from "lucide-react"
import Link from "next/link"
import { cn } from "cn"

import { Badge } from "@/components/ui/badge"
import { DeactivatedTag, UserAvatar } from "@/components/ui/user-avatar"
import { ROUTES, SearchParam, withQuery } from "@/lib/routes"

import { AttentionKind, type AttentionItem, type AttentionList, type ChipTone } from "../types/dashboard"
import { DevStatus, QaStatus } from "../types/status"
import { DrawerTab } from "../types/table"
import { TARGET_HORIZON_DAYS } from "../utils/dashboard-attention"
import { DevGlyph, QaGlyph } from "./status-glyphs"

/** Rows shown per list before "View all" links to the filtered table. */
const MAX_ITEMS = 5

const LIST: Record<AttentionKind, { title: string; note: string; icon: React.ReactNode; tone: string; filter?: Record<string, string> }> = {
  [AttentionKind.Blocked]: { title: "Blocked", note: "Dev status = Blocked", icon: <DevGlyph status={DevStatus.Blocked} />, tone: "bg-danger-tint text-danger-strong", filter: { [SearchParam.Dev]: DevStatus.Blocked } },
  [AttentionKind.QaFailed]: { title: "QA Failed", note: "Needs a fix and re-test", icon: <QaGlyph status={QaStatus.Failed} />, tone: "bg-danger-bg text-danger-fg", filter: { [SearchParam.Qa]: QaStatus.Failed } },
  [AttentionKind.Override]: { title: "Done by admin override", note: "Recorded in the audit log", icon: <TriangleAlertIcon className="size-3.5" />, tone: "bg-warning-bg text-warning-solid" },
  [AttentionKind.TargetDates]: { title: "Target dates", note: `Overdue and next ${TARGET_HORIZON_DAYS} days`, icon: <ClockIcon className="size-3.5" />, tone: "bg-gray-75 text-gray-700" },
}

const CHIP: Record<ChipTone, string> = {
  danger: "border-danger-border bg-danger-bg text-danger-fg",
  warning: "border-warning-border bg-warning-bg text-warning-fg",
  neutral: "border-gray-150 bg-gray-50 text-gray-700",
}

function AttentionRow({ item, href }: { item: AttentionItem; href: string }) {
  return (
    <Link href={href} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-t border-gray-75 px-4 py-2.5 text-foreground hover:bg-gray-25 hover:no-underline">
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex min-w-0 items-center gap-2">
          <span className="font-mono text-caption text-gray-700">{item.code}</span>
          <span className="truncate text-ui">{item.title}</span>
        </div>
        <div className="flex min-w-0 items-center gap-2 text-caption text-gray-600">
          {item.person ? (
            <>
              <UserAvatar userId={item.person.id} name={item.person.fullName} deactivated={item.person.deactivated} size="xs" />
              <span className={cn("flex-none", !item.person.deactivated && "text-gray-700")}>{item.person.fullName}</span>
              {item.person.deactivated && <DeactivatedTag />}
            </>
          ) : (
            <span className="flex-none">Unassigned</span>
          )}
          <span className="truncate">· {item.meta}</span>
        </div>
      </div>
      <Badge variant="outline" shape="round" className={cn("h-5 text-[11px] font-semibold", CHIP[item.chip.tone])}>{item.chip.label}</Badge>
    </Link>
  )
}

function AttentionCard({ list, projectCode }: { list: AttentionList; projectCode: string }) {
  const { title, note, icon, tone, filter } = LIST[list.kind]
  const drawer = (code: string) =>
    withQuery(ROUTES.project(projectCode), { [SearchParam.Fr]: code, [SearchParam.Panel]: list.kind === AttentionKind.Override ? DrawerTab.Audit : undefined })
  const hidden = list.items.length - MAX_ITEMS
  return (
    <section className="flex flex-col overflow-hidden rounded-[10px] border border-gray-150 bg-white">
      <div className="flex items-center gap-2 px-4 pt-3.5 pb-2.5">
        <span className={cn("inline-flex size-6 items-center justify-center rounded-md", tone)}>{icon}</span>
        <h2 className="text-[14px] font-semibold">{title}</h2>
        <Badge variant="count" size="sm">{list.items.length}</Badge>
        <span className="flex-1" />
        <span className="hidden text-caption text-gray-600 sm:inline">{note}</span>
      </div>
      {list.items.length === 0 && <p className="border-t border-gray-75 px-4 py-3 text-caption text-gray-600">Nothing here right now.</p>}
      {list.items.slice(0, MAX_ITEMS).map((item) => <AttentionRow key={item.id} item={item} href={drawer(item.code)} />)}
      {hidden > 0 && (
        <div className="border-t border-gray-75 px-4 pt-2 pb-3 text-caption font-medium">
          {filter ? <Link href={withQuery(ROUTES.project(projectCode), filter)}>View all {list.items.length} in the table</Link> : <span className="text-gray-600">+{hidden} more</span>}
        </div>
      )}
    </section>
  )
}

/** The four "needs attention" lists; each row opens the FR's drawer in the table view. */
export function DashboardAttention({ lists, projectCode }: { lists: AttentionList[]; projectCode: string }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {lists.map((list) => <AttentionCard key={list.kind} list={list} projectCode={projectCode} />)}
    </div>
  )
}

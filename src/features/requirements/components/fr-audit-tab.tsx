import { cn } from "cn"
import { TriangleAlertIcon } from "lucide-react"

import { DeactivatedTag } from "@/components/ui/user-avatar"
import { relativeTime } from "@/lib/format"

import type { FrAuditEntry } from "../types/requirement"

/** Audit log tab (FR-AUD-001): who changed which field from what to what, newest first. */
export function FrAuditTab({ entries }: { entries: FrAuditEntry[] }) {
  if (!entries.length) return <p className="text-ui text-gray-600">No changes recorded yet.</p>
  return (
    <ol className="flex flex-col">
      {entries.map((entry) => (
        <li key={entry.id} className="grid grid-cols-[16px_minmax(0,1fr)] gap-2.5 border-b border-gray-75 py-2.5">
          <span className={cn("mt-1.5 ml-1 size-2 rounded-full", entry.override ? "bg-warning-solid" : "bg-gray-400")} />
          <div className="flex min-w-0 flex-col gap-1">
            {entry.changes.map((change, i) => (
              <div key={i} className="flex flex-col gap-1">
                <span className="flex flex-wrap items-center gap-1.5 text-ui">
                  <span className={cn("font-semibold", entry.actor?.deactivated && "text-gray-600")}>{entry.actor?.fullName ?? "System"}</span>
                  {entry.actor?.deactivated && <DeactivatedTag />}
                  <span className="text-gray-600">changed</span>
                  <span className="font-medium">{change.field}</span>
                  {entry.override && (
                    <span className="inline-flex h-[18px] items-center gap-1 rounded-xs border border-warning-border bg-warning-bg px-1.5 text-overline font-semibold tracking-normal text-warning-fg">
                      <TriangleAlertIcon className="size-2.5" />Override
                    </span>
                  )}
                </span>
                <span className="flex flex-wrap items-center gap-2 text-caption">
                  <span className="text-gray-600 line-through">{change.from}</span>
                  <span className="text-gray-400">→</span>
                  <span className="font-medium">{change.to}</span>
                </span>
              </div>
            ))}
            {entry.reason && (
              <span className="rounded-md border border-warning-border bg-warning-subtle px-2 py-1.5 text-caption text-warning-strong">Reason: {entry.reason}</span>
            )}
            <span className="font-mono text-overline tracking-normal text-gray-500" title={entry.createdAt.toLocaleString()}>{relativeTime(entry.createdAt)}</span>
          </div>
        </li>
      ))}
    </ol>
  )
}

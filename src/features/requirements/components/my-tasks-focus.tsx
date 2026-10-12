import { cn } from "cn"

import { Button } from "@/components/ui/button"

import type { FocusItem } from "../utils/my-tasks"

const TAG = {
  blocked: { label: "Blocked", card: "border-danger-border bg-danger-subtle", pill: "border-danger-border bg-danger-tint text-danger-strong" },
  failed: { label: "QA Failed", card: "border-danger-border bg-danger-subtle", pill: "border-danger-mark bg-white text-danger-fg" },
  ready: { label: "Dev Done", card: "border-info-border bg-info-bg/50", pill: "border-success-border bg-success-tint text-success-fg" },
} as const

/**
 * "Needs your attention" (Developer) or "Ready for testing" (QA): one card per FR with why it
 * needs a look; the button expands that FR's row in the table below.
 */
export function MyTasksFocus({ title, subtitle, items, onOpen }: { title: string; subtitle: string; items: FocusItem[]; onOpen: (frId: string) => void }) {
  return (
    <section className="flex flex-col gap-2">
      <div className="flex flex-wrap items-baseline gap-2">
        <h2 className="text-ui font-semibold">{title}</h2>
        <span className="text-caption text-gray-600">{subtitle}</span>
      </div>
      <div className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-3">
        {items.map(({ task, tag, reason, action }) => (
          <div key={`${tag}-${task.id}`} className={cn("flex flex-col gap-1.5 rounded-xl border px-3 py-2.5", TAG[tag].card)}>
            <div className="flex items-center gap-2">
              <span className="font-mono text-overline tracking-normal text-gray-700">{task.code}</span>
              <span className="flex-1" />
              <span className={cn("inline-flex h-5 items-center rounded-full border px-2 text-[11px] font-semibold", TAG[tag].pill)}>{TAG[tag].label}</span>
            </div>
            <span className="line-clamp-2 text-ui font-medium">{task.title}</span>
            <span className="text-caption text-gray-700">{reason}</span>
            <span>
              <Button variant="outline" size="sm" className="bg-white" onClick={() => onOpen(task.id)}>{action}</Button>
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}

import { cn } from "cn"
import { CircleCheckIcon, ShieldCheckIcon, TriangleAlertIcon } from "lucide-react"
import type * as React from "react"

const TONE = {
  success: { box: "border-success-border bg-success-bg text-success-strong", Icon: CircleCheckIcon, icon: "text-success-solid" },
  verified: { box: "border-success-border bg-success-bg text-success-strong", Icon: ShieldCheckIcon, icon: "text-success-solid" },
  warning: { box: "border-warning-border bg-warning-bg text-warning-strong", Icon: TriangleAlertIcon, icon: "text-warning-solid" },
}

/** Assisted-workflow prompt inside the drawer (FR-WKF-001/002), with its action buttons. */
export function DrawerBanner({ tone, children, actions }: { tone: keyof typeof TONE; children: React.ReactNode; actions: React.ReactNode }) {
  const { box, Icon, icon } = TONE[tone]
  return (
    <div role={tone === "warning" ? "alert" : "status"} className={cn("flex items-start gap-3 rounded-lg border px-3.5 py-3", box)}>
      <Icon className={cn("mt-0.5 size-4 flex-none", icon)} />
      <div className="flex flex-1 flex-col gap-2 text-ui">
        <span>{children}</span>
        <span className="flex gap-1.5">{actions}</span>
      </div>
    </div>
  )
}

import { cn } from "cn"

type LiveState = "live" | "reconnecting" | "offline"

const STATE_STYLES: Record<LiveState, string> = {
  live: "border-border text-success-fg",
  reconnecting: "border-warning-border bg-warning-live text-warning-fg",
  offline: "border-input bg-gray-50 text-gray-700",
}

function PulseDot({ className }: { className?: string }) {
  return (
    <span className={cn("relative inline-flex size-2 flex-none", className)}>
      <span className="absolute inset-0 animate-pulse-ring rounded-full bg-current" />
      <span className="relative size-2 rounded-full bg-current" />
    </span>
  )
}

function StateMark({ state }: { state: LiveState }) {
  if (state === "live") return <PulseDot className="text-success-mark" />
  if (state === "reconnecting") {
    return (
      <span className="inline-block size-3 flex-none animate-spin-fast rounded-full border-[1.5px] border-warning-border border-t-warning-solid" />
    )
  }
  return <span className="size-2 rounded-full border-[1.5px] border-gray-500" />
}

function LiveIndicator({
  state,
  label,
  detail,
}: {
  state: LiveState
  label: string
  detail?: string
}) {
  return (
    <div
      role="status"
      className={cn(
        "inline-flex h-[26px] items-center gap-2 self-start rounded-full border px-2.5 text-caption font-medium",
        STATE_STYLES[state]
      )}
    >
      <StateMark state={state} />
      {label}
      {detail && <span className="font-normal text-muted-foreground">· {detail}</span>}
    </div>
  )
}

export { LiveIndicator, PulseDot, type LiveState }

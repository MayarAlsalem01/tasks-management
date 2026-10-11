import type { DevStatus, Priority, PrState, QaStatus, SpecStatus } from "../types/status"

// Shape families: circles = Dev, shields = QA, diamonds = Spec, bars = Priority.

export function DevGlyph({ status }: { status: DevStatus }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
      {status === "not-started" && (
        <circle cx="6" cy="6" r="4.6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2.2 1.8" />
      )}
      {status === "in-progress" && (
        <>
          <circle cx="6" cy="6" r="4.6" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M6 1.4a4.6 4.6 0 0 1 0 9.2z" fill="currentColor" />
        </>
      )}
      {status === "blocked" && (
        <>
          <circle cx="6" cy="6" r="4.6" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M3.7 6h4.6" stroke="currentColor" strokeWidth="1.5" />
        </>
      )}
      {status === "done" && (
        <>
          <circle cx="6" cy="6" r="5.4" fill="currentColor" />
          <path d="M3.6 6.1l1.6 1.6 3.2-3.3" fill="none" stroke="var(--glyph-knockout, #fff)" strokeWidth="1.5" />
        </>
      )}
    </svg>
  )
}

const SHIELD = "M6 1.2l4 1.4v3.1c0 2.5-1.7 4.1-4 5.1-2.3-1-4-2.6-4-5.1V2.6z"

export function QaGlyph({ status }: { status: QaStatus }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
      {status === "not-tested" ? (
        <path d={SHIELD} fill="none" stroke="currentColor" strokeWidth="1.2" />
      ) : (
        <path d={SHIELD} fill="currentColor" />
      )}
      {status === "passed" && (
        <path d="M4 6l1.4 1.4L8.1 4.7" fill="none" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" />
      )}
      {status === "failed" && (
        <path d="M4.5 4.5l3 3M7.5 4.5l-3 3" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" />
      )}
    </svg>
  )
}

const DIAMOND = "M5 0.8L9.2 5 5 9.2 0.8 5z"

export function SpecGlyph({ status, size = 10 }: { status: SpecStatus; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" aria-hidden className="flex-none">
      {status === "draft" && (
        <path d={DIAMOND} fill="none" stroke="var(--color-gray-500)" strokeWidth="1.2" strokeDasharray="1.6 1.2" />
      )}
      {status === "pending-review" && (
        <>
          <path d={DIAMOND} fill="none" stroke="var(--color-warning-mark)" strokeWidth="1.2" />
          <path d="M5 0.8L0.8 5 5 9.2z" fill="var(--color-warning-mark)" />
        </>
      )}
      {status === "approved" && <path d={DIAMOND} fill="var(--color-spec)" />}
    </svg>
  )
}

const BAR_FILLS: Record<Exclude<Priority, "critical">, [string, string, string]> = {
  high: ["var(--color-priority-high)", "var(--color-priority-high)", "var(--color-priority-high)"],
  medium: ["var(--color-priority-medium)", "var(--color-priority-medium)", "var(--color-gray-200)"],
  low: ["var(--color-gray-500)", "var(--color-gray-200)", "var(--color-gray-200)"],
}

export function PriorityGlyph({ priority }: { priority: Priority }) {
  if (priority === "critical") {
    return (
      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden className="flex-none">
        <rect width="12" height="12" rx="2.5" fill="var(--color-danger-solid)" />
        <path d="M6 3v3.6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="6" cy="8.8" r="0.85" fill="#fff" />
      </svg>
    )
  }
  const [a, b, c] = BAR_FILLS[priority]
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden className="flex-none">
      <rect x="1" y="8" width="2.5" height="3" rx="0.5" fill={a} />
      <rect x="4.75" y="5" width="2.5" height="6" rx="0.5" fill={b} />
      <rect x="8.5" y="2" width="2.5" height="9" rx="0.5" fill={c} />
    </svg>
  )
}

export function FlagGlyph({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" aria-hidden>
      <path d="M2.5 11V1.5M2.5 2h6.5l-1.5 2.2L9 6.5H2.5" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  )
}

export function PrGlyph({ state, size = 12 }: { state: PrState; size?: number }) {
  const stroke = { open: "var(--color-success-mark)", merged: "var(--color-spec)", draft: "var(--color-gray-500)", closed: "var(--color-danger-solid)" }[state]
  const common = { fill: "none", stroke, strokeWidth: 1.3 }
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" aria-hidden className="flex-none">
      <circle cx="3" cy="2.5" r="1.5" {...common} />
      <circle cx="3" cy="9.5" r="1.5" {...common} />
      {state === "open" && (
        <>
          <circle cx="9" cy="9.5" r="1.5" {...common} />
          <path d="M3 4v4M9 8V5a2 2 0 0 0-2-2H5.5" {...common} />
        </>
      )}
      {state === "merged" && (
        <>
          <circle cx="9" cy="5.5" r="1.5" {...common} />
          <path d="M3 4v4M7.5 5.5c-2.5 0-4.5-1-4.5-3" {...common} />
        </>
      )}
      {state === "draft" && (
        <>
          <circle cx="9" cy="9.5" r="1.5" {...common} strokeDasharray="1.5 1.2" />
          <path d="M3 4v4" {...common} />
        </>
      )}
      {state === "closed" && <path d="M3 4v4M7.5 3.5l3 3M10.5 3.5l-3 3" {...common} />}
    </svg>
  )
}

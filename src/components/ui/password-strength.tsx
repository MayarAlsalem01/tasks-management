import { cn } from "cn"

import { PASSWORD_STRENGTH_LABELS, passwordStrength } from "@/lib/auth/credentials"

const BAR_COLORS = ["", "bg-danger-solid", "bg-warning-mark", "bg-success-mark", "bg-success-solid"]

/** Four-bar strength meter with a label, shown under new-password fields. Guidance only. */
function PasswordStrength({ password, className }: { password: string; className?: string }) {
  const score = passwordStrength(password)
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span className="grid flex-1 grid-cols-4 gap-1" aria-hidden>
        {[1, 2, 3, 4].map((bar) => (
          <span
            key={bar}
            className={cn("h-1 rounded-full", bar <= score ? BAR_COLORS[score] : "bg-gray-150")}
          />
        ))}
      </span>
      <span className="w-24 text-caption font-medium text-gray-700" aria-live="polite">
        {PASSWORD_STRENGTH_LABELS[score]}
      </span>
    </div>
  )
}

export { PasswordStrength }

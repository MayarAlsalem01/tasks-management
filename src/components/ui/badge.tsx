import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Slot } from "radix-ui"

const badgeVariants = cva(
  "group/badge inline-flex w-fit shrink-0 items-center gap-1.5 overflow-hidden border border-transparent font-medium whitespace-nowrap transition-colors focus-visible:shadow-focus [&>svg]:pointer-events-none [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-cobalt-100 text-cobalt-700",
        secondary: "bg-gray-100 text-gray-700",
        neutral: "bg-gray-50 text-gray-700",
        outline: "border-gray-300 bg-white text-gray-650",
        destructive: "bg-danger-tint text-danger-strong",
        success: "bg-success-tint text-success-fg",
        warning: "bg-warning-bg text-warning-fg",
        tag: "bg-gray-50 text-muted-foreground",
        count: "bg-gray-75 font-mono text-foreground",
      },
      shape: {
        square: "rounded-xs",
        round: "rounded-full",
      },
      size: {
        default: "h-[22px] px-2 text-caption",
        sm: "h-[18px] px-1.5 text-overline tracking-normal",
      },
    },
    defaultVariants: {
      variant: "default",
      shape: "square",
      size: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  shape = "square",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant, shape, size }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Slot } from "radix-ui"

import { Spinner } from "@/components/ui/spinner"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-md border border-transparent bg-clip-padding text-ui font-medium whitespace-nowrap transition-colors outline-none select-none focus-visible:shadow-focus disabled:pointer-events-none aria-disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-cobalt-600 active:bg-cobalt-700",
        secondary:
          "border-input bg-secondary text-secondary-foreground hover:border-gray-300 hover:bg-gray-50 aria-expanded:bg-gray-50",
        outline:
          "border-input bg-secondary text-secondary-foreground hover:border-gray-300 hover:bg-gray-50 aria-expanded:bg-gray-50",
        ghost:
          "text-gray-700 hover:bg-accent hover:text-foreground aria-expanded:bg-accent",
        destructive:
          "bg-danger-solid text-white hover:bg-danger-strong focus-visible:shadow-[0_0_0_2px_#fff,0_0_0_4px_var(--color-danger-solid)]",
        warning:
          "bg-warning-solid text-white hover:bg-warning-solid-hover focus-visible:shadow-[0_0_0_2px_#fff,0_0_0_4px_var(--color-warning-solid)]",
        link: "h-auto! px-0! text-cobalt-600 hover:text-cobalt-700 hover:underline",
      },
      size: {
        default: "h-8 gap-1.5 px-3 has-data-[icon=inline-start]:pl-2.5",
        sm: "h-7 gap-1 px-2.5 text-caption",
        lg: "h-9 gap-1.5 px-3.5 text-body",
        icon: "size-8",
        "icon-sm": "size-7",
      },
    },
    compoundVariants: [
      { variant: "ghost", size: "default", className: "px-2.5" },
      {
        variant: ["default", "destructive", "warning"],
        className:
          "disabled:bg-gray-100 disabled:text-gray-400 aria-disabled:bg-gray-100 aria-disabled:text-gray-400 aria-disabled:hover:bg-gray-100",
      },
      {
        variant: ["secondary", "outline"],
        className:
          "disabled:border-border disabled:bg-gray-25 disabled:text-gray-400 aria-disabled:border-border aria-disabled:bg-gray-25 aria-disabled:text-gray-400",
      },
      {
        variant: "ghost",
        className:
          "disabled:text-gray-400 aria-disabled:text-gray-400 aria-disabled:hover:bg-transparent",
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    loading?: boolean
  }

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  loading = false,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button"
  const onSolid = variant === "default" || variant === "destructive" || variant === "warning"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      aria-busy={loading || undefined}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          {loading && (
            <Spinner
              className={cn("size-3", onSolid ? "text-white" : "text-gray-700")}
            />
          )}
          {children}
        </>
      )}
    </Comp>
  )
}

export { Button, buttonVariants }

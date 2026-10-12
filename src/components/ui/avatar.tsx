"use client"

import * as React from "react"
import { cn } from "cn"
import { Avatar as AvatarPrimitive } from "radix-ui"

function Avatar({
  className,
  size = "default",
  deactivated = false,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root> & {
  size?: "xs" | "sm" | "default" | "lg"
  deactivated?: boolean
}) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={size}
      data-deactivated={deactivated || undefined}
      className={cn(
        "group/avatar relative flex size-8 shrink-0 rounded-full select-none data-[size=lg]:size-10 data-[size=sm]:size-6 data-[size=xs]:size-5 data-deactivated:after:absolute data-deactivated:after:inset-0 data-deactivated:after:rounded-full data-deactivated:after:border-[1.5px] data-deactivated:after:border-dashed data-deactivated:after:border-gray-400",
        className
      )}
      {...props}
    />
  )
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn(
        "aspect-square size-full rounded-full object-cover",
        className
      )}
      {...props}
    />
  )
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "flex size-full items-center justify-center rounded-full bg-muted text-caption font-semibold text-muted-foreground group-data-[size=lg]/avatar:text-[14px] group-data-[size=sm]/avatar:text-[10px] group-data-[size=xs]/avatar:text-[9px] group-data-deactivated/avatar:bg-gray-50 group-data-deactivated/avatar:text-gray-500",
        className
      )}
      {...props}
    />
  )
}

function AvatarBadge({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="avatar-badge"
      className={cn(
        "absolute right-0 bottom-0 z-10 inline-flex items-center justify-center rounded-full bg-success-mark text-primary-foreground bg-blend-color ring-2 ring-white select-none",
        "group-data-[size=sm]/avatar:size-2 group-data-[size=sm]/avatar:[&>svg]:hidden",
        "group-data-[size=default]/avatar:size-2.5 group-data-[size=default]/avatar:[&>svg]:size-2",
        "group-data-[size=lg]/avatar:size-3 group-data-[size=lg]/avatar:[&>svg]:size-2",
        className
      )}
      {...props}
    />
  )
}

function AvatarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-group"
      className={cn(
        "group/avatar-group flex -space-x-1.5 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-white",
        className
      )}
      {...props}
    />
  )
}

function AvatarGroupCount({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-group-count"
      className={cn(
        "relative flex size-8 shrink-0 items-center justify-center rounded-full bg-muted font-mono text-[10px] font-semibold text-gray-700 ring-2 ring-white group-has-data-[size=lg]/avatar-group:size-10 group-has-data-[size=sm]/avatar-group:size-6 [&>svg]:size-4 group-has-data-[size=lg]/avatar-group:[&>svg]:size-5 group-has-data-[size=sm]/avatar-group:[&>svg]:size-3",
        className
      )}
      {...props}
    />
  )
}

export {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarBadge,
}

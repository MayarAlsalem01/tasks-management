"use client"

import { cn } from "cn"
import { ChevronDownIcon } from "lucide-react"
import type * as React from "react"

import { UserAvatar, UserAvatarStack } from "@/components/ui/user-avatar"

import type { Person } from "../types/requirement"

/**
 * The button that opens an inline edit menu: a borderless "cell" in the table, or a bordered
 * "field" in the drawer. Read-only values are rendered without it (Role Variants spec).
 */
export function MenuTrigger({
  variant = "cell",
  className,
  children,
  ...props
}: React.ComponentProps<"button"> & { variant?: "cell" | "field" }) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex min-w-0 items-center gap-1 rounded-md outline-none focus-visible:shadow-focus aria-expanded:bg-gray-75",
        variant === "cell" ? "-mx-1 h-7 px-1 hover:bg-gray-75" : "h-[30px] w-full max-w-60 gap-2 border border-input bg-white px-2 hover:border-gray-300",
        className,
      )}
      {...props}
    >
      {children}
      {variant === "field" && <span className="flex-1" />}
      <ChevronDownIcon className="size-3 flex-none text-gray-600" />
    </button>
  )
}

/** "Unassigned", one avatar with a first name, or an avatar stack for several people. */
export function AssigneeSummary({ people, full = false }: { people: Person[]; full?: boolean }) {
  if (!people.length) return <span className="text-caption text-gray-600">Unassigned</span>
  if (people.length > 1) {
    return <UserAvatarStack users={people.map((p) => ({ userId: p.id, name: p.fullName }))} max={3} />
  }
  const [person] = people
  return (
    <span className={cn("inline-flex min-w-0 items-center gap-1.5 text-caption", person.deactivated && "text-gray-600")}>
      <UserAvatar userId={person.id} name={person.fullName} size="xs" deactivated={person.deactivated} />
      <span className="truncate">{full ? person.fullName : person.fullName.split(" ")[0]}</span>
      {person.deactivated && <span className="rounded-xs border border-input px-0.5 text-[10px] text-gray-600">Deact.</span>}
    </span>
  )
}

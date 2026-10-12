"use client"

import type * as React from "react"

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UserAvatar } from "@/components/ui/user-avatar"

import type { Person } from "../types/requirement"

// Menus are portaled, but React events still bubble to a table row behind the trigger.
const stop = (event: React.SyntheticEvent) => event.stopPropagation()

/** Multi-select of people in a dropdown that stays open while picking (controlled). */
export function PeoplePicker({ title, people, value, onChange, children }: { title: string; people: Person[]; value: string[]; onChange: (ids: string[]) => void; children: React.ReactNode }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={stop}>{children}</DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64" onClick={stop}>
        <DropdownMenuLabel className="font-mono text-overline tracking-wider text-gray-600 uppercase">{title}</DropdownMenuLabel>
        {people.length === 0 && <p className="px-2 py-1.5 text-caption text-gray-600">No project members have this role yet.</p>}
        {people.map((person) => (
          <DropdownMenuCheckboxItem
            key={person.id}
            checked={value.includes(person.id)}
            onCheckedChange={(checked) => onChange(checked ? [...value, person.id] : value.filter((id) => id !== person.id))}
            onSelect={(event) => event.preventDefault()}
          >
            <UserAvatar userId={person.id} name={person.fullName} size="xs" />
            {person.fullName}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

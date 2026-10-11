"use client"

import { ChevronDownIcon } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UserAvatar } from "@/components/ui/user-avatar"
import { signOut } from "@/features/auth"

export type ShellUser = { id: string; fullName: string; email: string; rolesLabel: string }

const SOON = ["Profile", "Notification preferences", "Keyboard shortcuts"]

/** Header user menu: identity, roles, upcoming settings (disabled) and Sign out. */
export function UserMenu({ user }: { user: ShellUser }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex h-10 items-center gap-2 rounded-lg pr-2 pl-1 text-left outline-none hover:bg-gray-50 focus-visible:shadow-focus data-[state=open]:bg-gray-100">
        <UserAvatar userId={user.id} name={user.fullName} size="default" />
        <span className="flex flex-col leading-[15px]">
          <span className="text-ui font-medium">{user.fullName}</span>
          <span className="text-overline text-gray-600">{user.rolesLabel}</span>
        </span>
        <ChevronDownIcon className="size-3 text-gray-600" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-65 p-0">
        <div className="flex items-center gap-2.5 border-b border-gray-75 p-3">
          <UserAvatar userId={user.id} name={user.fullName} size="lg" />
          <div className="flex min-w-0 flex-col">
            <span className="text-ui font-semibold">{user.fullName}</span>
            <span className="truncate text-caption text-gray-600">{user.email}</span>
          </div>
        </div>
        <div className="flex justify-between gap-3 border-b border-gray-75 px-3 py-2 text-caption">
          <span className="text-gray-600">Roles</span>
          <span className="text-right font-medium">{user.rolesLabel}</span>
        </div>
        <DropdownMenuGroup className="p-1">
          {SOON.map((label) => (
            <DropdownMenuItem key={label} disabled className="justify-between">
              {label}
              <span className="text-overline text-gray-500">Soon</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="my-0" />
        <form action={signOut} className="p-1">
          <DropdownMenuItem asChild>
            <button type="submit" className="w-full">Sign out</button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

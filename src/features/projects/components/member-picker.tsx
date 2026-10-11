"use client"

import { Button } from "@/components/ui/button"
import { UserAvatar } from "@/components/ui/user-avatar"

import type { MemberOption } from "../types/project"

/**
 * Add/Remove list of project members. Selected ids are submitted as `memberIds` hidden
 * inputs. Admins aren't listed: they can access every project.
 */
export function MemberPicker({
  options,
  value,
  onChange,
}: {
  options: MemberOption[]
  value: string[]
  onChange: (ids: string[]) => void
}) {
  const toggle = (id: string) => onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id])

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <span className="text-caption font-medium text-gray-700">
          Members <span className="font-normal text-gray-500">· {value.length} + admins</span>
        </span>
        <span className="text-caption text-gray-600">Admins can access every project</span>
      </div>
      {value.map((id) => <input key={id} type="hidden" name="memberIds" value={id} />)}
      <div className="max-h-55 overflow-y-auto rounded-lg border border-gray-200">
        {options.length === 0 && <p className="px-3 py-3 text-ui text-gray-600">No developers or QA engineers yet.</p>}
        {options.map((option) => {
          const selected = value.includes(option.id)
          return (
            <div key={option.id} className="flex h-10 items-center gap-2.5 border-b border-gray-75 px-3 last:border-b-0">
              <UserAvatar userId={option.id} name={option.fullName} size="sm" />
              <span className="flex-1 truncate text-ui">{option.fullName}</span>
              <span className="hidden text-caption text-gray-600 sm:inline">{option.rolesLabel}</span>
              <Button
                type="button"
                size="sm"
                variant={selected ? "outline" : "secondary"}
                className={selected ? "w-17" : "w-17 border-cobalt-200 bg-cobalt-50 text-cobalt-700 hover:bg-cobalt-100"}
                aria-pressed={selected}
                onClick={() => toggle(option.id)}
              >
                {selected ? "Remove" : "Add"}
              </Button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

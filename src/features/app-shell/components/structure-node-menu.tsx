"use client"

import { MoreHorizontalIcon, PencilIcon, Trash2Icon } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { DeleteStructureDialog, RenameStructureDialog, type StructureNode } from "@/features/requirements"

const MenuDialog = { Rename: "rename", Delete: "delete" } as const
type MenuDialog = (typeof MenuDialog)[keyof typeof MenuDialog]

/**
 * The "⋯" menu on an activity or step row in the sidebar tree (Admin/PO): rename or delete.
 * It sits over the row's right edge and shows on hover or focus, so the row needs `group/node`.
 */
export function StructureNodeMenu({ node, onDeleted }: { node: StructureNode; onDeleted: () => void }) {
  const [dialog, setDialog] = useState<MenuDialog | null>(null)
  const close = () => setDialog(null)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`${node.name} actions`}
            className="absolute top-0 right-0 opacity-0 group-hover/node:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100"
          >
            <MoreHorizontalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onSelect={() => setDialog(MenuDialog.Rename)}><PencilIcon />Rename</DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onSelect={() => setDialog(MenuDialog.Delete)}><Trash2Icon />Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {dialog === MenuDialog.Rename && <RenameStructureDialog node={node} onClose={close} />}
      {dialog === MenuDialog.Delete && <DeleteStructureDialog node={node} onDeleted={onDeleted} onClose={close} />}
    </>
  )
}

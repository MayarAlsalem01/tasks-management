"use client"

import { CheckIcon, CircleSlashIcon } from "lucide-react"
import { useTransition } from "react"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { formatRoles, hasAdminRole } from "@/lib/auth/roles"

import { setUserDeactivatedAction } from "../actions/user-actions"
import type { AdminUserRow } from "../types/user"

const KEPT = [
  "Past comments, notes, PR links and status changes stay attributed to them.",
  "Existing FR assignments are kept and marked Deactivated. Reassign them when ready.",
  "Audit log entries remain, labelled with their deactivated status.",
]

function projectAccess(user: AdminUserRow) {
  if (hasAdminRole(user.roles)) return "all projects"
  return `${user.projects.length} ${user.projects.length === 1 ? "project" : "projects"}`
}

/**
 * Confirmation for deactivating (FR-IAM-003) or reactivating a user, chosen from the user's
 * current status. Explains what is kept, since nothing is deleted.
 */
export function UserStatusDialog({ user, onClose }: { user: AdminUserRow; onClose: () => void }) {
  const [pending, startTransition] = useTransition()
  const deactivating = !user.deactivated

  const confirm = () =>
    startTransition(async () => {
      const result = await setUserDeactivatedAction(user.id, deactivating)
      if (result.status === "error") {
        toast.error(result.message)
        return
      }
      toast.success(deactivating ? `${user.fullName} deactivated. History preserved.` : `${user.fullName} reactivated`)
      onClose()
    })

  return (
    <AlertDialog open onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="sm:max-w-120">
        <AlertDialogHeader className="flex-row items-start gap-3.5 text-left">
          <span className={`flex size-9 flex-none items-center justify-center rounded-full ${deactivating ? "bg-danger-bg text-danger-solid" : "bg-success-bg text-success-solid"}`}>
            {deactivating ? <CircleSlashIcon className="size-4.5" /> : <CheckIcon className="size-4.5" />}
          </span>
          <div className="flex flex-col gap-2">
            <AlertDialogTitle>{deactivating ? "Deactivate" : "Reactivate"} {user.fullName}?</AlertDialogTitle>
            {deactivating ? (
              <>
                <AlertDialogDescription className="text-gray-700">
                  {user.fullName} will no longer be able to sign in. Nothing is deleted.
                </AlertDialogDescription>
                <ul className="flex flex-col gap-1.5 rounded-lg border border-gray-150 bg-gray-25 px-3 py-2.5 text-ui">
                  {KEPT.map((line) => (
                    <li key={line} className="flex gap-2"><span className="text-success-solid">✓</span>{line}</li>
                  ))}
                  <li className="flex gap-2"><span className="text-gray-700">–</span>They won&apos;t appear in assignee pickers. Active sessions end immediately.</li>
                </ul>
                <p className="text-caption text-gray-600">You can reactivate this account at any time.</p>
              </>
            ) : (
              <AlertDialogDescription className="text-gray-700">
                They&apos;ll be able to sign in again with their current password, with the {formatRoles(user.roles)} role
                {user.roles.length > 1 ? "s" : ""} and access to {projectAccess(user)}. Earlier assignments are not restored automatically.
              </AlertDialogDescription>
            )}
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel variant="ghost" disabled={pending}>Cancel</AlertDialogCancel>
          <Button variant={deactivating ? "destructive" : "default"} onClick={confirm} loading={pending} disabled={pending}>
            {deactivating ? "Deactivate user" : "Reactivate user"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

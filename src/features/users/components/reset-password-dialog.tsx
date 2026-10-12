"use client"

import { CopyIcon, KeyRoundIcon } from "lucide-react"
import { useState, useTransition } from "react"
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

import { resetUserPasswordAction } from "../actions/user-actions"
import type { AdminUserRow } from "../types/user"

/**
 * Confirms a password reset, then shows the new temporary password once so the admin can
 * share it. The user is signed out everywhere and must choose a new password at next sign-in.
 */
export function ResetPasswordDialog({ user, onClose }: { user: AdminUserRow; onClose: () => void }) {
  const [pending, startTransition] = useTransition()
  const [password, setPassword] = useState<string | null>(null)

  const reset = () =>
    startTransition(async () => {
      const result = await resetUserPasswordAction(user.id)
      if (result.status === "error" || !result.message) {
        toast.error(result.message ?? "Couldn't reset the password.")
        return
      }
      setPassword(result.message)
    })

  const copy = async () => {
    if (!password) return
    try {
      await navigator.clipboard.writeText(password)
      toast.success("Password copied")
    } catch {
      toast.error("Couldn't copy. Select the password and copy it manually.")
    }
  }

  return (
    <AlertDialog open onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="sm:max-w-115">
        <AlertDialogHeader className="flex-row items-start gap-3.5 text-left">
          <span className="flex size-9 flex-none items-center justify-center rounded-full bg-cobalt-50 text-cobalt-500">
            <KeyRoundIcon className="size-4.5" />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <AlertDialogTitle>{password ? "Temporary password" : `Reset ${user.fullName}'s password?`}</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-700">
              {password
                ? "Share it securely. It won't be shown again, and they'll choose their own at next sign-in."
                : "They'll be signed out everywhere and get a new temporary password to change at next sign-in."}
            </AlertDialogDescription>
            {password && (
              <div className="flex items-center gap-2 rounded-lg border border-gray-150 bg-gray-25 px-3 py-2">
                <code className="flex-1 truncate font-mono text-body select-all">{password}</code>
                <Button variant="ghost" size="icon-sm" onClick={copy} aria-label="Copy password"><CopyIcon /></Button>
              </div>
            )}
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {password ? (
            <Button onClick={onClose}>Done</Button>
          ) : (
            <>
              <AlertDialogCancel variant="ghost" disabled={pending}>Cancel</AlertDialogCancel>
              <Button onClick={reset} loading={pending} disabled={pending}>Reset password</Button>
            </>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

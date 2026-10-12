"use client"

import { TriangleAlertIcon } from "lucide-react"
import type * as React from "react"
import { useState } from "react"

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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import type { FrRow } from "../types/requirement"
import type { OverrideRequest } from "../types/schemas"

function WarningHeader({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <AlertDialogHeader className="flex-row items-start gap-3.5 text-left">
      <span className="flex size-9 flex-none items-center justify-center rounded-full bg-warning-bg text-warning-solid">
        <TriangleAlertIcon className="size-4.5" />
      </span>
      <div className="flex flex-col gap-1.5">
        <AlertDialogTitle>{title}</AlertDialogTitle>
        <AlertDialogDescription asChild><div className="text-ui text-gray-700 text-pretty">{children}</div></AlertDialogDescription>
      </div>
    </AlertDialogHeader>
  )
}

/**
 * FR-WKF-001 Override Confirmation Dialog: lists the ACs that aren't dev-done and lets an
 * Admin/PO force Done alone or also mark every AC dev-done, with an optional reason. Both
 * are recorded in the audit log as `OVERRIDE_DEV_DONE`.
 */
export function OverrideDialog({ fr, actorName, onConfirm, onClose }: { fr: FrRow; actorName: string; onConfirm: (input: OverrideRequest) => void; onClose: () => void }) {
  const [reason, setReason] = useState("")
  const pending = fr.acs.filter((ac) => !ac.devDone)
  return (
    <AlertDialog open onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="gap-0 p-0 sm:max-w-130">
        <div className="flex flex-col gap-4 p-5">
          <WarningHeader title="Override completion check?">
            {pending.length} of {fr.acs.length} ACs of {fr.code} are not dev-done. This override will be recorded in the audit log.
          </WarningHeader>
          <ul className="ml-12.5 flex max-h-36 flex-col gap-1 overflow-y-auto text-caption text-gray-700">
            {pending.map((ac) => (
              <li key={ac.id} className="flex gap-2"><span className="font-mono font-medium">{ac.code}</span><span className="line-clamp-1">{ac.text}</span></li>
            ))}
          </ul>
          <div className="ml-12.5 flex flex-col gap-1.5">
            <Label htmlFor="override-reason" className="text-caption text-gray-700">Reason <span className="font-normal text-gray-500">(optional)</span></Label>
            <Textarea id="override-reason" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Why is this FR being marked Done?" className="resize-none" />
          </div>
        </div>
        <AlertDialogFooter className="flex-wrap items-center gap-2 border-t border-warning-border bg-warning-subtle px-5 py-3">
          <span className="mr-auto text-caption text-warning-fg">Logged as override · {actorName}</span>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button variant="outline" onClick={() => onConfirm({ markAllAcs: false, reason })}>Force Done only</Button>
          <Button variant="warning" onClick={() => onConfirm({ markAllAcs: true, reason })}>Force Done &amp; mark all ACs</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

/** FR-WKF-002: confirmation before setting QA status to Passed while some ACs haven't passed. */
export function ConfirmPassedDialog({ fr, onConfirm, onClose }: { fr: FrRow; onConfirm: () => void; onClose: () => void }) {
  const unpassed = fr.acs.filter((ac) => !ac.qaPassed).length
  return (
    <AlertDialog open onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="gap-0 p-0 sm:max-w-115">
        <div className="p-5">
          <WarningHeader title="Incomplete criteria">
            {unpassed} of {fr.acs.length} ACs have not passed QA verification. Are you sure you want to mark this requirement as Passed?
          </WarningHeader>
        </div>
        <AlertDialogFooter className="gap-2 border-t border-warning-border bg-warning-subtle px-5 py-3">
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button variant="warning" onClick={onConfirm}>Confirm Passed</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

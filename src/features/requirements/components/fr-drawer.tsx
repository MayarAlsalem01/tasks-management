"use client"

import { XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { updateFrFieldsAction } from "../actions/requirement-actions"
import { useFrDetail } from "../hooks/use-fr-detail"
import type { FrRow } from "../types/requirement"
import { DrawerTab } from "../types/table"
import type { FrPermissions } from "../utils/permissions"
import { FrDetailPanel } from "./fr-detail-panel"
import { useFr } from "./fr-context"
import { InlineText } from "./inline-text"
import { AcSummary, DevStatusPill, OpenIssuesFlag, QaStatusPill } from "./status-pills"

const READ_ONLY: FrPermissions = { canManage: false, canEditDev: false, canEditQa: false }

const TABS = [
  { value: DrawerTab.Details, label: "Details" },
  { value: DrawerTab.Acs, label: "Acceptance criteria" },
  { value: DrawerTab.Discussion, label: "Discussion" },
  { value: DrawerTab.Audit, label: "Audit log" },
]

/**
 * FR detail drawer (FR-UI-001): header, title and status pills, then Details, Acceptance
 * criteria, Discussion and Audit log tabs. Non-modal, so the table stays usable and clicking
 * another row switches FRs; Escape or the close button closes it. Archived FRs are read-only.
 */
export function FrDrawer({ fr, tab, onTab, onClose }: { fr: FrRow; tab: DrawerTab; onTab: (tab: DrawerTab) => void; onClose: () => void }) {
  const { permissions, run } = useFr()
  const effective = fr.archived ? READ_ONLY : permissions
  const detail = useFrDetail(fr.id)
  const devDone = fr.acs.filter((ac) => ac.devDone).length
  const qaPassed = fr.acs.filter((ac) => ac.qaPassed).length

  return (
    <Sheet open modal={false} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" showCloseButton={false} showOverlay={false} onInteractOutside={(e) => e.preventDefault()} className="w-full gap-0 p-0 sm:max-w-[560px]">
        <div className="flex h-[52px] flex-none items-center gap-2.5 border-b border-gray-75 pr-3 pl-5">
          <SheetTitle className="font-mono text-caption font-medium text-gray-700">{fr.code}</SheetTitle>
          <span className="truncate text-caption text-gray-500">{fr.activityName} › {fr.stepName}</span>
          <span className="flex-1" />
          <SheetClose asChild><Button variant="ghost" size="icon-sm" aria-label="Close drawer"><XIcon /></Button></SheetClose>
        </div>
        <SheetDescription className="sr-only">{fr.title}</SheetDescription>
        {fr.archived && <p role="status" className="flex-none border-b border-gray-150 bg-gray-50 px-5 py-2 text-caption text-gray-700">This requirement is archived and read-only.</p>}
        <div className="flex flex-none flex-col gap-3 px-5 pt-4">
          {effective.canManage ? (
            <InlineText multiline label="Requirement text" value={fr.title} className="text-body font-medium" onSave={(title) => run(fr.id, () => updateFrFieldsAction({ frId: fr.id, fields: { title } }), { patch: { fr: { title } } })} />
          ) : (
            <p className="text-title-2 text-pretty">{fr.title}</p>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <DevStatusPill status={fr.dev} />
            <QaStatusPill status={fr.qa} />
            {fr.openIssues && <OpenIssuesFlag />}
            <span className="flex-1" />
            <AcSummary dev={devDone} qa={qaPassed} total={fr.acs.length} className="text-overline tracking-normal" />
          </div>
        </div>
        <Tabs value={tab} onValueChange={(value) => onTab(value as DrawerTab)} className="min-h-0 flex-1 gap-0">
          <TabsList variant="line" className="mx-5 w-auto justify-start gap-4.5">
            {TABS.map((t) => (
              <TabsTrigger key={t.value} value={t.value} className="flex-none px-0">
                {t.label}
                {t.value === DrawerTab.Discussion && !!detail.data?.comments.length && <span className="rounded-xs bg-gray-75 px-1 font-mono text-overline tracking-normal text-gray-700">{detail.data.comments.length}</span>}
              </TabsTrigger>
            ))}
          </TabsList>
          {TABS.map((t) => (
            <TabsContent key={t.value} value={t.value} className="min-h-0 overflow-y-auto px-5 pt-4 pb-6">
              <FrDetailPanel tab={t.value} fr={fr} permissions={effective} canArchive={permissions.canManage} detail={detail} />
            </TabsContent>
          ))}
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}

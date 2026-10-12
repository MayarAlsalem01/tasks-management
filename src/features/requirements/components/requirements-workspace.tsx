"use client"

import type * as React from "react"

import type { ProjectNav } from "@/features/projects"
import type { Role } from "@/lib/auth/roles"
import { SearchParam } from "@/lib/routes"

import { useFrMutations } from "../hooks/use-fr-mutations"
import { useStatusFlow } from "../hooks/use-status-flow"
import { useTableParams } from "../hooks/use-table-params"
import type { FrRow, ProjectPerson } from "../types/requirement"
import { DrawerTab } from "../types/table"
import { frPermissions, type FrPermissions } from "../utils/permissions"
import type { TableParams } from "../utils/table-params"
import { FrProvider } from "./fr-context"
import { FrDrawer } from "./fr-drawer"
import { ConfirmPassedDialog, OverrideDialog } from "./workflow-dialogs"

export type RequirementsViewProps = {
  project: ProjectNav
  rows: FrRow[]
  people: ProjectPerson[]
  viewer: { fullName: string; roles: Role[] }
}

export type Workspace = {
  /** Server rows with optimistic patches applied. */
  rows: FrRow[]
  params: TableParams
  update: (changes: Record<string, string | undefined>) => void
  clearFilters: () => void
  permissions: FrPermissions
  requestDevStatus: ReturnType<typeof useStatusFlow>["requestDevStatus"]
  openFr: (code: string, panel?: DrawerTab) => void
}

/**
 * The parts every project view shares (table and board): URL state, the optimistic mutation
 * path, role permissions and the status workflow, plus the FR drawer and the override /
 * confirm-passed dialogs. The view's own body comes from `children`.
 */
export function RequirementsWorkspace({ project, rows: serverRows, people, viewer, children }: RequirementsViewProps & { children: (workspace: Workspace) => React.ReactNode }) {
  const { params, update, clearFilters } = useTableParams()
  const { rows, run } = useFrMutations(serverRows)
  const permissions = frPermissions(viewer.roles)
  const flow = useStatusFlow(run, permissions)

  const openFr = (code: string, panel?: DrawerTab) => update({ [SearchParam.Fr]: code, [SearchParam.Panel]: panel, [SearchParam.New]: undefined, [SearchParam.Parent]: undefined })
  const selected = params.fr ? rows.find((r) => r.code === params.fr) : undefined

  return (
    <FrProvider value={{ project, people, permissions, run, requestDevStatus: flow.requestDevStatus, requestQaStatus: flow.requestQaStatus, openFr }}>
      {children({ rows, params, update, clearFilters, permissions, requestDevStatus: flow.requestDevStatus, openFr })}
      {selected && (
        <FrDrawer
          key={selected.id}
          fr={selected}
          tab={params.panel}
          onTab={(panel) => update({ [SearchParam.Panel]: panel === DrawerTab.Details ? undefined : panel })}
          onClose={() => update({ [SearchParam.Fr]: undefined, [SearchParam.Panel]: undefined })}
        />
      )}
      {flow.overrideFr && <OverrideDialog fr={flow.overrideFr} actorName={viewer.fullName} onConfirm={flow.confirmOverride} onClose={flow.closeDialogs} />}
      {flow.confirmPassedFr && <ConfirmPassedDialog fr={flow.confirmPassedFr} onConfirm={flow.confirmPassed} onClose={flow.closeDialogs} />}
    </FrProvider>
  )
}

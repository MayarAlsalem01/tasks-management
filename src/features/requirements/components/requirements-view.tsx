"use client"

import type { ProjectNav } from "@/features/projects"
import type { Role } from "@/lib/auth/roles"
import { NewItem, SearchParam } from "@/lib/routes"

import { useFrMutations } from "../hooks/use-fr-mutations"
import { useStatusFlow } from "../hooks/use-status-flow"
import { useTableParams } from "../hooks/use-table-params"
import { useVisibleColumns } from "../hooks/use-visible-columns"
import type { FrRow, ProjectPerson } from "../types/requirement"
import { DrawerTab } from "../types/table"
import { frPermissions } from "../utils/permissions"
import { describeFilters, hasActiveFilters } from "../utils/table-params"
import { filterRows } from "../utils/table-rows"
import { CreateFrDialog } from "./create-fr-dialog"
import { CreateActivityDialog, CreateStepDialog } from "./create-structure-dialogs"
import { FrProvider } from "./fr-context"
import { FrDrawer } from "./fr-drawer"
import { NoActivities, NoRequirements, NoResults } from "./requirements-empty"
import { RequirementsTable } from "./requirements-table"
import { RequirementsToolbar } from "./requirements-toolbar"
import { ConfirmPassedDialog, OverrideDialog } from "./workflow-dialogs"

type RequirementsViewProps = {
  project: ProjectNav
  rows: FrRow[]
  people: ProjectPerson[]
  viewer: { fullName: string; roles: Role[] }
}

/**
 * The interactive project table (FR-UI-001): toolbar, grouped grid, FR drawer, workflow
 * dialogs and create dialogs. All view state lives in the URL; edits go through
 * `useFrMutations` with optimistic updates and role checks from `frPermissions`.
 */
export function RequirementsView({ project, rows: serverRows, people, viewer }: RequirementsViewProps) {
  const { params, update, clearFilters } = useTableParams()
  const { rows, run } = useFrMutations(serverRows)
  const permissions = frPermissions(viewer.roles)
  const flow = useStatusFlow(run, permissions)
  const columns = useVisibleColumns()

  const openFr = (code: string, panel?: DrawerTab) => update({ [SearchParam.Fr]: code, [SearchParam.Panel]: panel, [SearchParam.New]: undefined, [SearchParam.Parent]: undefined })
  const openNew = (item: NewItem, parent?: string) => update({ [SearchParam.New]: item, [SearchParam.Parent]: parent })
  const closeNew = () => update({ [SearchParam.New]: undefined, [SearchParam.Parent]: undefined })
  const visible = filterRows(rows, params)
  const selected = params.fr ? rows.find((r) => r.code === params.fr) : undefined

  const body = (() => {
    if (!project.activities.length) return <NoActivities canManage={permissions.canManage} onCreate={() => openNew(NewItem.Activity)} />
    if (!rows.some((r) => !r.archived) && !params.archived) return <NoRequirements canManage={permissions.canManage} onCreate={() => openNew(NewItem.Fr, params.step)} />
    if (!visible.length) return <NoResults summary={describeFilters(params, (id) => people.find((p) => p.id === id)?.fullName) || "Nothing in this step yet."} onClear={hasActiveFilters(params) ? clearFilters : undefined} />
    return <RequirementsTable rows={visible} groupBy={params.group} columns={columns.visible} selectedCode={params.fr} />
  })()

  return (
    <FrProvider value={{ project, people, permissions, run, requestDevStatus: flow.requestDevStatus, requestQaStatus: flow.requestQaStatus, openFr }}>
      <RequirementsToolbar params={params} people={people} columns={columns.visible} onToggleColumn={columns.toggle} update={update} onClear={clearFilters} />
      <div className="min-h-0 flex-1 overflow-auto">{body}</div>
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
      {permissions.canManage && params.new === NewItem.Activity && <CreateActivityDialog projectId={project.id} onClose={closeNew} />}
      {permissions.canManage && params.new === NewItem.Step && <CreateStepDialog activities={project.activities} activityId={params.parent} onClose={closeNew} />}
      {permissions.canManage && params.new === NewItem.Fr && (
        <CreateFrDialog
          project={project}
          people={people}
          existingCodes={rows.map((r) => r.code)}
          stepId={params.parent ?? params.step}
          onCreated={(code) => openFr(code, DrawerTab.Acs)}
          onClose={closeNew}
        />
      )}
    </FrProvider>
  )
}

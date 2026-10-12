"use client"

import { NewItem, SearchParam } from "@/lib/routes"

import { useVisibleColumns } from "../hooks/use-visible-columns"
import { DrawerTab } from "../types/table"
import { describeFilters, hasActiveFilters } from "../utils/table-params"
import { filterRows } from "../utils/table-rows"
import { CreateFrDialog } from "./create-fr-dialog"
import { CreateActivityDialog, CreateStepDialog } from "./create-structure-dialogs"
import { NoActivities, NoRequirements, NoResults } from "./requirements-empty"
import { RequirementsTable } from "./requirements-table"
import { RequirementsToolbar } from "./requirements-toolbar"
import { RequirementsWorkspace, type RequirementsViewProps, type Workspace } from "./requirements-workspace"

/**
 * The interactive project table (FR-UI-001): toolbar, grouped grid and create dialogs, inside
 * the shared workspace (drawer, workflow dialogs). All view state lives in the URL; edits go
 * through `useFrMutations` with optimistic updates and role checks from `frPermissions`.
 */
export function RequirementsView(props: RequirementsViewProps) {
  const columns = useVisibleColumns()
  const { project, people } = props

  const render = ({ rows, params, update, clearFilters, permissions, openFr }: Workspace) => {
    const openNew = (item: NewItem, parent?: string) => update({ [SearchParam.New]: item, [SearchParam.Parent]: parent })
    const closeNew = () => update({ [SearchParam.New]: undefined, [SearchParam.Parent]: undefined })
    const visible = filterRows(rows, params)

    const body = (() => {
      if (!project.activities.length) return <NoActivities canManage={permissions.canManage} onCreate={() => openNew(NewItem.Activity)} />
      if (!rows.some((r) => !r.archived) && !params.archived) return <NoRequirements canManage={permissions.canManage} onCreate={() => openNew(NewItem.Fr, params.step)} />
      if (!visible.length) return <NoResults summary={describeFilters(params, (id) => people.find((p) => p.id === id)?.fullName) || "Nothing in this step yet."} onClear={hasActiveFilters(params) ? clearFilters : undefined} />
      return <RequirementsTable rows={visible} groupBy={params.group} columns={columns.visible} selectedCode={params.fr} />
    })()

    return (
      <>
        <RequirementsToolbar params={params} people={people} columns={columns.visible} onToggleColumn={columns.toggle} update={update} onClear={clearFilters} />
        <div className="min-h-0 flex-1 overflow-auto">{body}</div>
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
      </>
    )
  }

  return <RequirementsWorkspace {...props}>{render}</RequirementsWorkspace>
}

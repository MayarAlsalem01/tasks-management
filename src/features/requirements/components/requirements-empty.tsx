import { DiamondIcon, PlusIcon, SearchIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"

/** Empty project: no activities yet (admins can start one; others wait for the PO). */
export function NoActivities({ canManage, onCreate }: { canManage: boolean; onCreate: () => void }) {
  return (
    <EmptyState
      className="m-6 border-0 py-16"
      icon={<DiamondIcon />}
      title="No activities yet"
      description={canManage ? "Start by adding an activity, then break it into steps and functional requirements." : "Activities and requirements are added by the Product Owner. They will appear here."}
      action={canManage && <Button onClick={onCreate}><PlusIcon />Create first activity</Button>}
    />
  )
}

/** Activities exist but no FR has been written yet. */
export function NoRequirements({ canManage, onCreate }: { canManage: boolean; onCreate: () => void }) {
  return (
    <EmptyState
      className="m-6 border-0 py-16"
      icon={<DiamondIcon />}
      title="No requirements yet"
      description={canManage ? "Add the first functional requirement to a step." : "Requirements are added by the Product Owner. They will appear here."}
      action={canManage && <Button onClick={onCreate}><PlusIcon />New FR</Button>}
    />
  )
}

/** Filters (or the selected step) leave nothing to show. */
export function NoResults({ summary, onClear }: { summary: string; onClear?: () => void }) {
  return (
    <EmptyState
      className="m-6 border-0 py-16"
      icon={<SearchIcon />}
      title="No FRs match these filters"
      description={summary}
      action={onClear && <Button variant="outline" onClick={onClear}>Clear filters</Button>}
    />
  )
}

"use client"

import { createContext, use } from "react"
import type * as React from "react"

import type { ProjectNav } from "@/features/projects"

import type { RunMutation } from "../hooks/use-fr-mutations"
import type { ProjectPerson, FrRow } from "../types/requirement"
import type { DevStatus, QaStatus } from "../types/status"
import type { FrPermissions } from "../utils/permissions"

/** What status menus and AC checks need: permissions and the mutation/workflow helpers. */
export type FrActionsValue = {
  permissions: FrPermissions
  run: RunMutation
  requestDevStatus: (fr: FrRow, status: DevStatus) => void
  requestQaStatus: (fr: FrRow, status: QaStatus) => void
}

export type FrContextValue = FrActionsValue & {
  project: ProjectNav
  people: ProjectPerson[]
  openFr: (code: string) => void
}

const FrActionsContext = createContext<FrActionsValue | null>(null)
const FrContext = createContext<FrContextValue | null>(null)

/** Actions only, for views that span projects (My Tasks). */
export const FrActionsProvider = FrActionsContext.Provider

/** A project view: actions plus the project, its people and the drawer opener. */
export function FrProvider({ value, children }: { value: FrContextValue; children: React.ReactNode }) {
  return (
    <FrActionsContext value={value}>
      <FrContext value={value}>{children}</FrContext>
    </FrActionsContext>
  )
}

/** Project, people, permissions and mutation helpers for every part of a project view. */
export function useFr() {
  const value = use(FrContext)
  if (!value) throw new Error("useFr must be used inside <FrProvider>")
  return value
}

/** Permissions and mutation helpers; works in project views and in My Tasks. */
export function useFrActions() {
  const value = use(FrActionsContext)
  if (!value) throw new Error("useFrActions must be used inside <FrProvider> or <FrActionsProvider>")
  return value
}

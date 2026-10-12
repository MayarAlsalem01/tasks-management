"use client"

import { createContext, use } from "react"

import type { ProjectNav } from "@/features/projects"

import type { RunMutation } from "../hooks/use-fr-mutations"
import type { ProjectPerson, FrRow } from "../types/requirement"
import type { DevStatus, QaStatus } from "../types/status"
import type { FrPermissions } from "../utils/permissions"

export type FrContextValue = {
  project: ProjectNav
  people: ProjectPerson[]
  permissions: FrPermissions
  run: RunMutation
  requestDevStatus: (fr: FrRow, status: DevStatus) => void
  requestQaStatus: (fr: FrRow, status: QaStatus) => void
  openFr: (code: string) => void
}

const FrContext = createContext<FrContextValue | null>(null)

export const FrProvider = FrContext.Provider

/** Project, people, permissions and mutation helpers for every part of the requirements view. */
export function useFr() {
  const value = use(FrContext)
  if (!value) throw new Error("useFr must be used inside <FrProvider>")
  return value
}

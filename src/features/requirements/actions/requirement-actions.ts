"use server"

import { z } from "zod"

import { actionErrorState, validationErrorState, type ActionState } from "@/lib/action-state"
import { requireUser, type CurrentUser } from "@/lib/auth/session"
import { AppError, GENERIC_ERROR_MESSAGE } from "@/lib/errors"
import { idSchema } from "@/lib/validation"

import { getCachedFrDetail } from "../cache/queries"
import { revalidateRequirements } from "../cache/revalidate"
import type { FrDetail } from "../types/requirement"
import {
  acTextSchema,
  commentSchema,
  createActivitySchema,
  createFrSchema,
  createStepSchema,
  frFieldsSchema,
  moveAcSchema,
  notesSchema,
  PR_URL_PATTERN,
  pullRequestSchema,
  reportDefectSchema,
  setAssigneesSchema,
  setDevStatusSchema,
  setQaStatusSchema,
  toggleAcSchema,
} from "../types/schemas"
import { archiveAc, createAc, moveAc, updateAcText } from "./ac-mutations"
import { addComment, addPullRequest, setAssignees, updateFrFields, updateNotes } from "./fr-mutations"
import { loadFr } from "./requirement-context"
import { reportDefect, setAcDevDone, setAcQaPassed, setDevStatus, setQaStatus } from "./status-mutations"
import { createActivity, createFr, createStep, setFrArchived } from "./structure-mutations"

/**
 * The shared shape of every requirement Server Action: validate → require a session → run
 * the service (which checks project access and role) → invalidate caches (plus the feeds of
 * anyone notified) → `ActionState`. Services return the ids they notified, if any.
 */
async function run<S extends z.ZodType>(
  schema: S,
  input: unknown,
  context: string,
  service: (data: z.output<S>, viewer: CurrentUser) => Promise<readonly string[] | void>,
  message?: string,
): Promise<ActionState> {
  const parsed = schema.safeParse(input)
  if (!parsed.success) return validationErrorState(parsed.error)
  try {
    const viewer = await requireUser()
    const notified = await service(parsed.data, viewer)
    revalidateRequirements(notified ?? [])
    return { status: "success", message }
  } catch (error) {
    return actionErrorState(error, `requirements.${context}`)
  }
}

// ── Create dialogs (form actions for useActionState) ─────────────────────────────────────

export async function createActivityAction(_prev: ActionState, formData: FormData) {
  const input = { projectId: formData.get("projectId"), name: formData.get("name") }
  return run(createActivitySchema, input, "createActivity", (d, v) => createActivity(d.projectId, d.name, v), "Activity created")
}

export async function createStepAction(_prev: ActionState, formData: FormData) {
  const input = { activityId: formData.get("activityId"), name: formData.get("name") }
  return run(createStepSchema, input, "createStep", (d, v) => createStep(d.activityId, d.name, v), "Step created")
}

/** Creates an FR from the New FR dialog; the success message carries the new code. */
export async function createFrAction(_prev: ActionState, formData: FormData) {
  const input = {
    stepId: formData.get("stepId"),
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    priority: formData.get("priority"),
    spec: formData.get("spec"),
    developerIds: formData.getAll("developerIds"),
    qaIds: formData.getAll("qaIds"),
    targetDate: formData.get("targetDate") ?? "",
  }
  let code = ""
  const state = await run(createFrSchema, input, "createFr", async (d, v) => {
    const created = await createFr(d, v)
    code = created.code
    return created.notified
  })
  return state.status === "success" ? { ...state, message: code } : state
}

// ── FR fields, status and assignees ──────────────────────────────────────────────────────

const updateFieldsInput = z.object({ frId: idSchema, fields: frFieldsSchema })
export async function updateFrFieldsAction(input: z.input<typeof updateFieldsInput>) {
  return run(updateFieldsInput, input, "updateFields", (d, v) => updateFrFields(d.frId, d.fields, v))
}

export async function setAssigneesAction(input: z.input<typeof setAssigneesSchema>) {
  return run(setAssigneesSchema, input, "setAssignees", (d, v) => setAssignees(d.frId, d.role, d.userIds, v))
}

/** Dev status change with FR-WKF-001 gating; Admin/PO pass `override` after confirming. */
export async function setDevStatusAction(input: z.input<typeof setDevStatusSchema>) {
  return run(setDevStatusSchema, input, "setDevStatus", (d, v) => setDevStatus(d.frId, d.status, d.override, v))
}

export async function setQaStatusAction(input: z.input<typeof setQaStatusSchema>) {
  return run(setQaStatusSchema, input, "setQaStatus", (d, v) => setQaStatus(d.frId, d.status, v))
}

const archiveInput = z.object({ frId: idSchema, archived: z.boolean() })
export async function setFrArchivedAction(input: z.input<typeof archiveInput>) {
  return run(archiveInput, input, "setArchived", (d, v) => setFrArchived(d.frId, d.archived, v))
}

// ── Acceptance criteria ──────────────────────────────────────────────────────────────────

export async function setAcDevDoneAction(input: z.input<typeof toggleAcSchema>) {
  return run(toggleAcSchema, input, "setAcDevDone", (d, v) => setAcDevDone(d.acId, d.value, v))
}

export async function setAcQaPassedAction(input: z.input<typeof toggleAcSchema>) {
  return run(toggleAcSchema, input, "setAcQaPassed", (d, v) => setAcQaPassed(d.acId, d.value, v))
}

export async function reportDefectAction(input: z.input<typeof reportDefectSchema>) {
  return run(reportDefectSchema, input, "reportDefect", (d, v) => reportDefect(d.acId, d.note, v))
}

const createAcInput = acTextSchema.extend({ frId: idSchema })
export async function createAcAction(input: z.input<typeof createAcInput>) {
  return run(createAcInput, input, "createAc", ({ frId, ...text }, v) => createAc(frId, text, v))
}

const updateAcInput = acTextSchema.extend({ acId: idSchema })
export async function updateAcAction(input: z.input<typeof updateAcInput>) {
  return run(updateAcInput, input, "updateAc", ({ acId, ...text }, v) => updateAcText(acId, text, v))
}

export async function moveAcAction(input: z.input<typeof moveAcSchema>) {
  return run(moveAcSchema, input, "moveAc", (d, v) => moveAc(d.acId, d.direction, v))
}

const acIdInput = z.object({ acId: idSchema })
export async function archiveAcAction(input: z.input<typeof acIdInput>) {
  return run(acIdInput, input, "archiveAc", (d, v) => archiveAc(d.acId, v))
}

// ── Discussion ───────────────────────────────────────────────────────────────────────────

export async function updateNotesAction(input: z.input<typeof notesSchema>) {
  return run(notesSchema, input, "updateNotes", (d, v) => updateNotes(d.frId, d.notes, v))
}

export async function addPullRequestAction(input: z.input<typeof pullRequestSchema>) {
  return run(pullRequestSchema, input, "addPullRequest", (d, v) => {
    const [, repo, number] = PR_URL_PATTERN.exec(d.url) ?? []
    return addPullRequest(d.frId, d.url, `${repo} #${number}`, v)
  })
}

export async function addCommentAction(input: z.input<typeof commentSchema>) {
  return run(commentSchema, input, "addComment", (d, v) => addComment(d.frId, d.body, v))
}

// ── Reads ────────────────────────────────────────────────────────────────────────────────

export type FrDetailResult = { status: "success"; detail: FrDetail } | { status: "error"; message: string }

/**
 * Loads the drawer's Discussion and Audit data for React Query, after checking the caller
 * can open the FR's project. Failures come back as values, never thrown.
 */
export async function getFrDetailAction(frId: string): Promise<FrDetailResult> {
  const id = idSchema.safeParse(frId)
  if (!id.success) return { status: "error", message: "Unknown requirement." }
  try {
    const viewer = await requireUser()
    await loadFr(id.data, viewer, { write: false })
    const detail = await getCachedFrDetail(id.data)
    if (!detail) throw new AppError("NOT_FOUND", "This requirement doesn't exist anymore.")
    return { status: "success", detail }
  } catch (error) {
    return { status: "error", message: actionErrorState(error, "requirements.detail").message ?? GENERIC_ERROR_MESSAGE }
  }
}

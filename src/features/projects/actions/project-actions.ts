"use server"

import { z } from "zod"

import { actionErrorState, validationErrorState, type ActionState } from "@/lib/action-state"
import { requireAdmin } from "@/lib/auth/session"
import { idSchema } from "@/lib/validation"

import { revalidateProjects } from "../cache/revalidate"
import { createProjectSchema, projectFormSchema } from "../types/project"
import { createProject, setProjectArchived, updateProject } from "./project-mutations"

function readProjectForm(formData: FormData) {
  return {
    name: formData.get("name"),
    code: formData.get("code"),
    description: formData.get("description") ?? "",
    memberIds: formData.getAll("memberIds"),
  }
}

/** Admin Server Action: create a project from the New project dialog. */
export async function createProjectAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = createProjectSchema.safeParse(readProjectForm(formData))
  if (!parsed.success) return validationErrorState(parsed.error)
  try {
    const actor = await requireAdmin()
    const project = await createProject(parsed.data, actor.id)
    revalidateProjects()
    return { status: "success", message: `${project.name} created` }
  } catch (error) {
    return actionErrorState(error, "projects.create")
  }
}

/** Admin Server Action: save the Edit project dialog (name, description, members). */
export async function updateProjectAction(projectId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const id = idSchema.safeParse(projectId)
  const parsed = projectFormSchema.safeParse(readProjectForm(formData))
  if (!id.success) return validationErrorState(id.error)
  if (!parsed.success) return validationErrorState(parsed.error)
  try {
    const actor = await requireAdmin()
    await updateProject(id.data, parsed.data, actor.id)
    revalidateProjects()
    return { status: "success", message: `${parsed.data.name} updated` }
  } catch (error) {
    return actionErrorState(error, "projects.update")
  }
}

const archiveArgsSchema = z.tuple([idSchema, z.boolean()])

/** Admin Server Action: archive (`archived = true`) or restore a project. */
export async function setProjectArchivedAction(projectId: string, archived: boolean): Promise<ActionState> {
  const args = archiveArgsSchema.safeParse([projectId, archived])
  if (!args.success) return validationErrorState(args.error)
  try {
    const actor = await requireAdmin()
    await setProjectArchived(...args.data, actor.id)
    revalidateProjects()
    return { status: "success" }
  } catch (error) {
    return actionErrorState(error, archived ? "projects.archive" : "projects.restore")
  }
}

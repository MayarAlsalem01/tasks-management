import "server-only"

import { and, eq, isNull } from "drizzle-orm"

import { db } from "@/lib/db"
import { activities, steps } from "@/lib/db/schema"
import { AppError } from "@/lib/errors"

/**
 * Loads a live (not deleted) activity for a structure service.
 * @throws {AppError} `NOT_FOUND` when it's missing or deleted.
 */
export async function loadActivity(activityId: string) {
  const [activity] = await db
    .select({ id: activities.id, projectId: activities.projectId, name: activities.name })
    .from(activities)
    .where(and(eq(activities.id, activityId), isNull(activities.deletedAt)))
  if (!activity) throw new AppError("NOT_FOUND", "This activity doesn't exist anymore.", { field: "activityId" })
  return activity
}

/**
 * Loads a live step whose activity is live too, for a structure service.
 * @throws {AppError} `NOT_FOUND` when the step or its activity is missing or deleted.
 */
export async function loadStep(stepId: string) {
  const [step] = await db
    .select({ id: steps.id, projectId: activities.projectId, name: steps.name })
    .from(steps)
    .innerJoin(activities, and(eq(activities.id, steps.activityId), isNull(activities.deletedAt)))
    .where(and(eq(steps.id, stepId), isNull(steps.deletedAt)))
  if (!step) throw new AppError("NOT_FOUND", "This step doesn't exist anymore.", { field: "stepId" })
  return step
}

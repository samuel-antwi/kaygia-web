import { defineEventHandler } from "h3"
import { z } from "zod"
import { eq } from "drizzle-orm"
import { getDb } from "../../../../../../../server/utils/db"
import { projects, projectComments } from "../../../../../../../server/db/schema"
import { hasAdminAccess } from "#layers/admin/utils/adminAccess"

const createCommentSchema = z.object({
  message: z.string().min(1, "Message is required").max(5000),
  type: z.enum(["response", "note", "update"]).default("response")
})

export default defineEventHandler(async (event) => {
  // Get the user session
  const session = await getUserSession(event)
  const user = session?.user

  // Verify admin role
  if (!user || !hasAdminAccess(user.role)) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden: Admin access required."
    })
  }

  // Get project ID
  const projectId = getRouterParam(event, "id")
  if (!projectId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Project ID is required"
    })
  }

  // Parse and validate request body
  const body = await readBody(event)
  const validatedData = createCommentSchema.parse(body)

  const db = getDb(event)

  // Check if project exists
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, projectId)
  })

  if (!project) {
    throw createError({
      statusCode: 404,
      statusMessage: "Project not found"
    })
  }

  // Insert admin comment
  const [newComment] = await db
    .insert(projectComments)
    .values({
      projectId,
      userId: user.id,
      message: validatedData.message,
      type: validatedData.type
    })
    .returning()

  if (!newComment) {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to create comment"
    })
  }

  return {
    id: newComment.id,
    message: newComment.message,
    type: newComment.type,
    createdAt: newComment.createdAt,
    userId: newComment.userId,
    userName: user.name,
    userRole: user.role
  }
})
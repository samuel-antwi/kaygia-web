import { defineEventHandler } from "h3"
import { z } from "zod"
import { eq } from "drizzle-orm"
import { getDb } from "../../../utils/db"
import { projects, projectComments, users } from "../../../db/schema"

const createCommentSchema = z.object({
  message: z.string().min(1, "Message is required").max(5000),
  type: z.enum(["comment", "question"]).default("comment")
})

export default defineEventHandler(async (event) => {
  // Get session
  const session = await getUserSession(event)
  if (!session.user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized"
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

  // Check if user has access to this project
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, projectId)
  })

  if (!project) {
    throw createError({
      statusCode: 404,
      statusMessage: "Project not found"
    })
  }

  // Check access - admin can comment on all, clients only their own
  if (session.user.role === "CLIENT" && project.clientId !== session.user.id) {
    throw createError({
      statusCode: 403,
      statusMessage: "Access denied"
    })
  }

  // Insert comment
  const [newComment] = await db
    .insert(projectComments)
    .values({
      projectId,
      userId: session.user.id,
      message: validatedData.message,
      type: validatedData.type
    })
    .returning()

  // Return the new comment with user info
  const [commentWithUser] = await db
    .select({
      id: projectComments.id,
      message: projectComments.message,
      type: projectComments.type,
      createdAt: projectComments.createdAt,
      userId: projectComments.userId,
      userName: users.name,
      userRole: users.role
    })
    .from(projectComments)
    .leftJoin(users, eq(projectComments.userId, users.id))
    .where(eq(projectComments.id, newComment!.id))

  return commentWithUser
})
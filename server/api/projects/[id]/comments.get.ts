import { defineEventHandler } from "h3"
import { eq, desc } from "drizzle-orm"
import { getDb } from "../../../utils/db"
import { projects, users, projectComments } from "../../../db/schema"

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

  // Check access - admin can see all, clients only their own
  if (session.user.role === "CLIENT" && project.clientId !== session.user.id) {
    throw createError({
      statusCode: 403,
      statusMessage: "Access denied"
    })
  }

  // Fetch comments with user information
  const comments = await db
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
    .where(eq(projectComments.projectId, projectId))
    .orderBy(desc(projectComments.createdAt))

  return comments
})
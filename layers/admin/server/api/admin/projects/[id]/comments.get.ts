import { defineEventHandler } from "h3"
import { eq, desc } from "drizzle-orm"
import { getDb } from "../../../../../../../server/utils/db"
import { projects, users, projectComments } from "../../../../../../../server/db/schema"
import { hasAdminAccess } from "#layers/admin/utils/adminAccess"

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

  // Fetch all comments for this project
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
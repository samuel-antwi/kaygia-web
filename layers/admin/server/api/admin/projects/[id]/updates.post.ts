import { defineEventHandler, getRouterParam, readBody, createError } from "h3";
import { getDb } from "../../../../../../../server/utils/db";
import { projectUpdates, projects } from "../../../../../../../server/db/schema";
import { eq } from "drizzle-orm";
import { hasAdminAccess } from "#layers/admin/utils/adminAccess";
import { randomUUID } from "crypto";

export default defineEventHandler(async (event) => {
  // Get project ID from params
  const id = getRouterParam(event, "id");

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request: Project ID is required",
    });
  }

  // Get the user session
  const session = await getUserSession(event);
  const user = session?.user;

  // Verify admin role
  if (!user || !hasAdminAccess(user.role)) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden: Admin access required.",
    });
  }

  // Get request body
  const body = await readBody(event);

  if (!body || !body.message || !body.type || !body.author) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request: Message, type, and author are required",
    });
  }

  // Valid update types
  const validTypes = ["progress", "milestone", "feedback", "general"];

  if (!validTypes.includes(body.type)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Bad Request: Type must be one of: ${validTypes.join(", ")}`,
    });
  }

  try {
    const db = getDb(event);

    // Verify project exists
    const project = await db.query.projects.findFirst({
      where: eq(projects.id, id),
    });

    if (!project) {
      throw createError({
        statusCode: 404,
        statusMessage: "Not Found: Project does not exist.",
      });
    }

    // Create new project update
    const updateId = randomUUID();
    await db.insert(projectUpdates).values({
      id: updateId,
      projectId: id,
      message: body.message,
      type: body.type,
      author: body.author,
      authorRole: body.authorRole || null,
    });

    // Fetch the created update
    const newUpdate = await db.query.projectUpdates.findFirst({
      where: eq(projectUpdates.id, updateId),
    });

    return {
      success: true,
      message: "Project update created successfully",
      update: newUpdate,
    };
  } catch (error: any) {
    console.error(`[API][Admin] Error creating project ${id} update:`, error);

    if (error.statusCode === 404) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error: Could not create project update.",
      data: error.message,
    });
  }
});
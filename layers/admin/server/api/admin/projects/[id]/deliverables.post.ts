import { defineEventHandler, getRouterParam, readBody, createError } from "h3";
import { getDb } from "~/server/utils/db";
import { projectDeliverables, projects } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { hasAdminAccess } from "~/layers/admin/utils/adminAccess";
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

  if (!body || !body.name || !body.type) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request: Name and type are required",
    });
  }

  // Valid deliverable types
  const validTypes = ["file", "link", "preview"];

  if (!validTypes.includes(body.type)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Bad Request: Type must be one of: ${validTypes.join(", ")}`,
    });
  }

  // Valid file types
  const validFileTypes = ["pdf", "image", "doc", "link"];

  if (body.fileType && !validFileTypes.includes(body.fileType)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Bad Request: File type must be one of: ${validFileTypes.join(", ")}`,
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

    // Create new deliverable
    const deliverableId = randomUUID();
    await db.insert(projectDeliverables).values({
      id: deliverableId,
      projectId: id,
      name: body.name,
      description: body.description || null,
      type: body.type,
      url: body.url || null,
      fileId: body.fileId || null,
      fileType: body.fileType || null,
      status: body.status || "pending",
    });

    // Fetch the created deliverable with related data
    const newDeliverable = await db.query.projectDeliverables.findFirst({
      where: eq(projectDeliverables.id, deliverableId),
      with: {
        file: true,
        approvedBy: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return {
      success: true,
      message: "Deliverable created successfully",
      deliverable: newDeliverable,
    };
  } catch (error: any) {
    console.error(`[API][Admin] Error creating project ${id} deliverable:`, error);

    if (error.statusCode === 404) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error: Could not create deliverable.",
      data: error.message,
    });
  }
});
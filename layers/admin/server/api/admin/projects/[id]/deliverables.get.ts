import { defineEventHandler, getRouterParam, createError } from "h3";
import { getDb } from "~/server/utils/db";
import { projectDeliverables, projects } from "~/server/db/schema";
import { eq, desc } from "drizzle-orm";
import { hasAdminAccess } from "~/layers/admin/utils/adminAccess";

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

    // Fetch project deliverables with related data
    const deliverables = await db.query.projectDeliverables.findMany({
      where: eq(projectDeliverables.projectId, id),
      orderBy: [desc(projectDeliverables.createdAt)],
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
      deliverables,
    };
  } catch (error: any) {
    console.error(
      `[API][Admin] Error fetching project ${id} deliverables:`,
      error
    );

    if (error.statusCode === 404) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage:
        "Internal Server Error: Could not fetch project deliverables.",
      data: error.message,
    });
  }
});

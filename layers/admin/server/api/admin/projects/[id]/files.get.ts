import { defineEventHandler, getRouterParam, createError } from "h3";
import { getDb } from "~/server/utils/db";
import { projectFiles, projects } from "~/server/db/schema";
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

    // Fetch project files with uploader info
    const files = await db.query.projectFiles.findMany({
      where: eq(projectFiles.projectId, id),
      orderBy: [desc(projectFiles.createdAt)],
      with: {
        uploadedBy: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Calculate total storage used
    const totalSize = files.reduce((sum, file) => sum + (file.size || 0), 0);

    return {
      success: true,
      files,
      metadata: {
        totalFiles: files.length,
        totalSize,
        lastUpload: files.length > 0 ? files[0].createdAt : null,
      },
    };
  } catch (error: any) {
    console.error(`[API][Admin] Error fetching project ${id} files:`, error);

    if (error.statusCode === 404) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error: Could not fetch project files.",
      data: error.message,
    });
  }
});

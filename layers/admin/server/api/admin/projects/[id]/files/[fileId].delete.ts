import { defineEventHandler, getRouterParam, createError } from "h3";
import { getDb } from "~/server/utils/db";
import { projectFiles, projects } from "~/server/db/schema";
import { eq, and } from "drizzle-orm";
import { hasAdminAccess } from "~/layers/admin/utils/adminAccess";

export default defineEventHandler(async (event) => {
  // Get project ID and file ID from params
  const projectId = getRouterParam(event, "id");
  const fileId = getRouterParam(event, "fileId");

  if (!projectId || !fileId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request: Project ID and File ID are required",
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
      where: eq(projects.id, projectId),
    });

    if (!project) {
      throw createError({
        statusCode: 404,
        statusMessage: "Not Found: Project does not exist.",
      });
    }

    // Verify file exists and belongs to the project
    const file = await db.query.projectFiles.findFirst({
      where: and(
        eq(projectFiles.id, fileId),
        eq(projectFiles.projectId, projectId)
      ),
    });

    if (!file) {
      throw createError({
        statusCode: 404,
        statusMessage: "Not Found: File does not exist.",
      });
    }

    // TODO: Implement actual file deletion from storage service
    // In a real implementation, you would:
    // 1. Delete the file from your storage service (Supabase, AWS S3, etc.)
    // 2. Then delete the database record
    // Example:
    // await storageService.deleteFile(file.path);

    // Delete file record from database
    await db
      .delete(projectFiles)
      .where(eq(projectFiles.id, fileId));

    return {
      success: true,
      message: "File deleted successfully",
    };
  } catch (error: any) {
    console.error(`[API][Admin] Error deleting file ${fileId}:`, error);

    if (error.statusCode === 404) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error: Could not delete file.",
      data: error.message,
    });
  }
});
import { defineEventHandler, getRouterParam, createError, setHeader } from "h3";
import { getDb } from "../../../../../../../../../server/utils/db";
import { projectFiles, projects } from "../../../../../../../../../server/db/schema";
import { eq, and } from "drizzle-orm";
import { hasAdminAccess } from "#layers/admin/utils/adminAccess";

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

    // TODO: Implement actual file download from storage service
    // In a real implementation, you would:
    // 1. Generate a signed URL from your storage service (Supabase, AWS S3, etc.)
    // 2. Either redirect to that URL or stream the file content
    // Example with redirect:
    // const downloadUrl = await storageService.getSignedUrl(file.path);
    // return sendRedirect(event, downloadUrl);
    
    // Example with streaming:
    // const fileStream = await storageService.getFileStream(file.path);
    // setHeader(event, 'Content-Type', file.mimeType || 'application/octet-stream');
    // setHeader(event, 'Content-Disposition', `attachment; filename="${file.originalName}"`);
    // return fileStream;

    // For now, return file metadata with a placeholder download URL
    setHeader(event, 'Content-Type', 'application/json');
    
    return {
      success: true,
      file: {
        id: file.id,
        name: file.originalName,
        mimeType: file.mimeType,
        size: file.size,
        // In a real implementation, this would be a signed download URL
        downloadUrl: `/api/admin/projects/${projectId}/files/${fileId}/download`,
        metadata: {
          type: file.type,
          uploadedAt: file.createdAt,
        },
      },
      message: "File download URL generated successfully",
      // TODO: Remove this note in production
      note: "This is a placeholder. In production, implement actual file storage integration.",
    };
  } catch (error: any) {
    console.error(`[API][Admin] Error downloading file ${fileId}:`, error);

    if (error.statusCode === 404) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error: Could not download file.",
      data: error.message,
    });
  }
});
import { defineEventHandler, getRouterParam, readMultipartFormData, createError } from "h3";
import { getDb } from "~/server/utils/db";
import { projectFiles, projects } from "~/server/db/schema";
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

    // Read multipart form data
    const formData = await readMultipartFormData(event);

    if (!formData || formData.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request: No files provided",
      });
    }

    const uploadedFiles = [];

    for (const item of formData) {
      if (item.filename && item.data) {
        // Generate unique file ID and path
        const fileId = randomUUID();
        const timestamp = Date.now();
        const extension = item.filename.split('.').pop() || '';
        const storagePath = `projects/${id}/${timestamp}-${fileId}.${extension}`;

        // Determine file type based on MIME type
        let fileType = "file";
        if (item.type?.startsWith("image/")) {
          fileType = "image";
        } else if (item.type?.includes("pdf")) {
          fileType = "document";
        } else if (item.type?.includes("text/") || item.type?.includes("application/")) {
          fileType = "document";
        }

        // TODO: Implement actual file storage (Supabase, AWS S3, etc.)
        // For now, we'll just store the metadata
        // In a real implementation, you would:
        // 1. Upload the file to your storage service
        // 2. Get the actual storage path/URL
        // 3. Store that path in the database

        // Insert file record into database
        await db.insert(projectFiles).values({
          id: fileId,
          projectId: id,
          name: item.filename,
          originalName: item.filename,
          path: storagePath,
          type: fileType,
          mimeType: item.type || null,
          size: item.data.length,
          uploadedBy: user.id,
        });

        // Fetch the created file record
        const newFile = await db.query.projectFiles.findFirst({
          where: eq(projectFiles.id, fileId),
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

        uploadedFiles.push(newFile);
      }
    }

    if (uploadedFiles.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request: No valid files found in the upload",
      });
    }

    return {
      success: true,
      message: `Successfully uploaded ${uploadedFiles.length} file(s)`,
      files: uploadedFiles,
    };
  } catch (error: any) {
    console.error(`[API][Admin] Error uploading files to project ${id}:`, error);

    if (error.statusCode === 404 || error.statusCode === 400) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error: Could not upload files.",
      data: error.message,
    });
  }
});
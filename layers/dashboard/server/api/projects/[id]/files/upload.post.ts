import { defineEventHandler, getRouterParam, readMultipartFormData } from "h3";
import { getDb } from "~/server/utils/db";
import { projects, projectFiles, users } from "~/server/db/schema";
import { and, eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { 
  uploadFile, 
  generateFilePath, 
  getFileTypeCategory, 
  isAllowedFileType, 
  getMaxFileSize,
  STORAGE_BUCKETS 
} from "~/server/utils/storage";

export default defineEventHandler(async (event) => {
  try {
    const projectId = getRouterParam(event, "id");
    if (!projectId) {
      throw createError({ statusCode: 400, statusMessage: "Project ID is required" });
    }

    // Get the user session
    const session = await getUserSession(event);
    if (!session?.user) {
      throw createError({ statusCode: 401, statusMessage: "Authentication required" });
    }

    // Initialize database connection
    const db = getDb(event);

    // Get the user
    const user = await db.query.users.findFirst({
      where: eq(users.email, session.user.email),
      columns: { id: true },
    });

    if (!user) {
      throw createError({ statusCode: 404, statusMessage: "User not found" });
    }

    // Verify project exists and user has access
    const project = await db.query.projects.findFirst({
      where: and(eq(projects.id, projectId), eq(projects.clientId, user.id)),
    });

    if (!project) {
      throw createError({ statusCode: 404, statusMessage: "Project not found" });
    }

    // Parse multipart form data
    const formData = await readMultipartFormData(event);
    if (!formData || formData.length === 0) {
      throw createError({ statusCode: 400, statusMessage: "No files uploaded" });
    }

    const uploadedFiles = [];

    for (const item of formData) {
      if (item.name === 'file' && item.filename && item.data) {
        const filename = item.filename;
        const mimeType = item.type || 'application/octet-stream';
        const fileSize = item.data.length;

        // Validate file type
        if (!isAllowedFileType(mimeType)) {
          throw createError({ 
            statusCode: 400, 
            statusMessage: `File type ${mimeType} is not allowed` 
          });
        }

        // Validate file size
        const maxSize = getMaxFileSize(mimeType);
        if (fileSize > maxSize) {
          throw createError({ 
            statusCode: 400, 
            statusMessage: `File size ${fileSize} exceeds maximum allowed size ${maxSize}` 
          });
        }

        // Generate storage path
        const storageFolder = getFileTypeCategory(mimeType);
        const storagePath = generateFilePath(projectId, filename, storageFolder);

        // Create File object for upload
        const file = new File([item.data], filename, { type: mimeType });

        // Upload to Supabase Storage
        const uploadResult = await uploadFile(
          file,
          STORAGE_BUCKETS.PROJECT_FILES,
          storagePath,
          {
            contentType: mimeType,
            upsert: false,
          }
        );

        // Save file metadata to database
        const fileId = uuidv4();
        const [savedFile] = await db
          .insert(projectFiles)
          .values({
            id: fileId,
            projectId: projectId,
            name: filename.split('.')[0], // Name without extension
            originalName: filename,
            path: storagePath,
            type: getFileTypeCategory(mimeType),
            mimeType: mimeType,
            size: fileSize,
            uploadedBy: user.id,
          })
          .returning();

        uploadedFiles.push({
          id: savedFile.id,
          name: savedFile.name,
          originalName: savedFile.originalName,
          type: savedFile.type,
          size: savedFile.size,
          createdAt: savedFile.createdAt,
        });
      }
    }

    if (uploadedFiles.length === 0) {
      throw createError({ statusCode: 400, statusMessage: "No valid files found" });
    }

    return {
      success: true,
      files: uploadedFiles,
      message: `Successfully uploaded ${uploadedFiles.length} file(s)`,
    };
  } catch (error: any) {
    console.error("Error uploading files:", error);
    
    if (error.statusCode) {
      throw error;
    }
    
    throw createError({ 
      statusCode: 500, 
      statusMessage: error.message || "Failed to upload files" 
    });
  }
});
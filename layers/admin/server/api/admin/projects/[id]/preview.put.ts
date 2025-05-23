import { defineEventHandler, getRouterParam, readBody, createError } from "h3";
import { getDb } from "~/server/utils/db";
import { projects } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { hasAdminAccess } from "~/layers/admin/utils/adminAccess";
import { z } from "zod";

const updateSchema = z.object({
  previewUrl: z.string().url().nullable().optional(),
  previewPassword: z.string().nullable().optional(),
  previewEnabled: z.boolean().optional(),
  previewExpiresAt: z.string().nullable().optional()
});

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

  // Parse and validate request body
  const body = await readBody(event);
  
  const validationResult = updateSchema.safeParse(body);
  if (!validationResult.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid request data",
      data: validationResult.error.errors
    });
  }

  const { previewUrl, previewPassword, previewEnabled, previewExpiresAt } = validationResult.data;

  try {
    const db = getDb(event);

    // Update project preview URL
    const updateData: any = {
      updatedAt: new Date()
    };

    // Only update fields that are provided
    if (previewUrl !== undefined) updateData.previewUrl = previewUrl;
    if (previewPassword !== undefined) updateData.previewPassword = previewPassword;
    if (previewEnabled !== undefined) updateData.previewEnabled = previewEnabled;
    if (previewExpiresAt !== undefined) {
      updateData.previewExpiresAt = previewExpiresAt ? new Date(previewExpiresAt) : null;
    }

    await db
      .update(projects)
      .set(updateData)
      .where(eq(projects.id, id));

    return {
      success: true,
      message: "Preview URL updated successfully"
    };
  } catch (error: any) {
    console.error(`[API][Admin] Error updating project ${id} preview URL:`, error);

    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error: Could not update preview URL.",
      data: error.message,
    });
  }
});
import { hasAdminAccess } from "~/layers/admin/utils/adminAccess";
import { supabaseStorage, STORAGE_BUCKETS } from "~/server/utils/storage";
import { users } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { getDb } from "~/server/utils/db";

export default defineEventHandler(async (event) => {
  // Check authentication
  const session = await getUserSession(event);
  if (!session?.user?.id || !hasAdminAccess(session.user.role)) {
    throw createError({
      statusCode: 403,
      statusMessage: "Unauthorized",
    });
  }

  // Get user ID from params
  const userId = getRouterParam(event, "userId");
  if (!userId) {
    throw createError({
      statusCode: 400,
      statusMessage: "User ID is required",
    });
  }

  try {
    const db = getDb(event);
    
    // Check if user exists and has avatar
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user.length) {
      throw createError({
        statusCode: 404,
        statusMessage: "User not found",
      });
    }

    if (!user[0].avatarUrl) {
      return {
        success: true,
        message: "No avatar to delete",
      };
    }

    // Delete avatar from storage
    try {
      // Extract path from URL
      const urlParts = user[0].avatarUrl.split('/');
      const bucketIndex = urlParts.indexOf('user-avatars');
      if (bucketIndex !== -1 && bucketIndex < urlParts.length - 1) {
        const avatarPath = urlParts.slice(bucketIndex + 1).join('/');
        await supabaseStorage.storage
          .from(STORAGE_BUCKETS.USER_AVATARS)
          .remove([avatarPath]);
      }
    } catch (error) {
      console.error("Error deleting avatar from storage:", error);
    }

    // Update user record
    await db
      .update(users)
      .set({ 
        avatarUrl: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    return {
      success: true,
      message: "Avatar deleted successfully",
    };
  } catch (error: any) {
    console.error("Avatar deletion error:", error);
    
    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Failed to delete avatar",
    });
  }
});
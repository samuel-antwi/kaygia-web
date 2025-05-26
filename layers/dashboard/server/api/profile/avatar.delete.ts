import { supabaseStorage, STORAGE_BUCKETS } from "../../../../../server/utils/storage";
import { users } from "../../../../../server/db/schema";
import { eq } from "drizzle-orm";
import { getDb } from "../../../../../server/utils/db";

export default defineEventHandler(async (event) => {
  // Check authentication
  const session = await getUserSession(event);
  if (!session?.user?.id) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  const userId = session.user.id;

  try {
    const db = getDb(event);
    
    // Check if user has avatar
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

    const currentUser = user[0];
    if (!currentUser?.avatarUrl) {
      return {
        success: true,
        message: "No avatar to delete",
      };
    }

    // Delete avatar from storage
    try {
      // Extract path from URL
      const urlParts = currentUser.avatarUrl.split('/');
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
  } catch (error) {
    console.error("Avatar deletion error:", error);
    
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: error instanceof Error ? error.message : "Failed to delete avatar",
    });
  }
});
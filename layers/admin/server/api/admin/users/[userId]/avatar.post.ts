import { createError } from 'h3'
import { z } from "zod";
import { hasAdminAccess } from "#layers/admin/utils/adminAccess";
import { supabaseStorage, STORAGE_BUCKETS } from "../../../../../../../server/utils/storage";
import { users } from "../../../../../../../server/db/schema";
import { eq } from "drizzle-orm";
import { getDb } from "../../../../../../../server/utils/db";

const uploadSchema = z.object({
  avatarDataUrl: z.string().refine(
    (val) => val.startsWith("data:image/"),
    "Invalid image data"
  ),
});

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

  // Validate request body
  const body = await readBody(event);
  const result = uploadSchema.safeParse(body);

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid request data",
      data: result.error.flatten().fieldErrors,
    });
  }

  const { avatarDataUrl } = result.data;

  try {
    const db = getDb(event);
    
    // Check if user exists
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

    // Convert data URL to buffer
    const base64Data = avatarDataUrl.split(",")[1];
    if (!base64Data) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid image data format",
      });
    }
    const buffer = Buffer.from(base64Data, "base64");
    
    // Get file extension from mime type
    const mimeMatch = avatarDataUrl.match(/data:image\/(\w+);/);
    const extension = mimeMatch ? mimeMatch[1] : "png";
    
    // Delete old avatar if exists
    if (user[0]?.avatarUrl) {
      try {
        // Extract path from URL
        const urlParts = user[0]?.avatarUrl?.split('/') || [];
        const bucketIndex = urlParts.indexOf('user-avatars');
        if (bucketIndex !== -1 && bucketIndex < urlParts.length - 1) {
          const oldPath = urlParts.slice(bucketIndex + 1).join('/');
          await supabaseStorage.storage
            .from(STORAGE_BUCKETS.USER_AVATARS)
            .remove([oldPath]);
        }
      } catch (error) {
        console.error("Error deleting old avatar:", error);
      }
    }
    
    // Upload new avatar
    const filename = `avatar-${Date.now()}.${extension}`;
    const filePath = `${userId}/${filename}`;
    
    const { error: uploadError } = await supabaseStorage.storage
      .from(STORAGE_BUCKETS.USER_AVATARS)
      .upload(filePath, buffer, {
        contentType: `image/${extension}`,
        upsert: true,
      });

    if (uploadError) {
      throw createError({
        statusCode: 500,
        statusMessage: "Failed to upload avatar",
      });
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseStorage.storage
      .from(STORAGE_BUCKETS.USER_AVATARS)
      .getPublicUrl(filePath);

    // Update user record
    await db
      .update(users)
      .set({ 
        avatarUrl: publicUrl,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    // Fetch updated user
    const updatedUser = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        company: users.company,
        avatarUrl: users.avatarUrl,
        role: users.role,
        emailVerified: users.emailVerified,
        active: users.active,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        lastLoggedIn: users.lastLoggedIn,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return {
      success: true,
      message: "Avatar uploaded successfully",
      user: updatedUser[0],
    };
  } catch (error: any) {
    console.error("Avatar upload error:", error);
    
    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Failed to upload avatar",
    });
  }
});
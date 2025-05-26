import { z } from "zod";
import { supabaseStorage, STORAGE_BUCKETS } from "../../../../../server/utils/storage";
import { users } from "../../../../../server/db/schema";
import { eq } from "drizzle-orm";
import { getDb } from "../../../../../server/utils/db";

const uploadSchema = z.object({
  avatarDataUrl: z.string().refine(
    (val) => val.startsWith("data:image/"),
    "Invalid image data"
  ),
});

export default defineEventHandler(async (event) => {
  // Check authentication
  const session = await getUserSession(event);
  if (!session?.user?.id) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
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
  const userId = session.user.id;

  try {
    const db = getDb(event);
    
    // Get current user to check for existing avatar
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
    const currentUser = user[0];
    if (currentUser?.avatarUrl) {
      try {
        // Extract path from URL
        const urlParts = currentUser.avatarUrl.split('/');
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
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return {
      success: true,
      message: "Avatar uploaded successfully",
      user: updatedUser[0],
    };
  } catch (error) {
    console.error("Avatar upload error:", error);
    
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: error instanceof Error ? error.message : "Failed to upload avatar",
    });
  }
});
import { z } from "zod";
import { getDb } from "~/server/utils/db";
import { users } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { defineEventHandler, readBody, createError, getRouterParam } from "h3";
import { hasAdminAccess } from "~/layers/admin/utils/adminAccess";

// No need to explicitly import getUserSession in h3 endpoints
// It's globally available in the server context

export default defineEventHandler(async (event) => {
  try {
    // Verify admin session
    const session = await getUserSession(event);
    const adminUser = session?.user;

    if (!adminUser || !hasAdminAccess(adminUser.role)) {
      throw createError({
        statusCode: 403,
        statusMessage: "Forbidden: Admin access required.",
      });
    }

    // Get user ID from URL
    const userId = getRouterParam(event, "userId");
    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request: Missing user ID",
      });
    }

    // User profile update schema
    const updateProfileSchema = z.object({
      name: z.string().min(1, "Name is required").optional(),
      email: z.string().email("Invalid email address").optional(),
      company: z.string().optional().nullable(),
    });

    // Validate request body
    const body = await readBody(event);
    const validatedData = updateProfileSchema.safeParse(body);

    if (!validatedData.success) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid input data",
        data: validatedData.error.format(),
      });
    }

    // Get database instance
    const db = getDb(event);
    const now = new Date();

    // Update user profile with additional updatedAt timestamp
    const updatedUser = await db
      .update(users)
      .set({
        ...validatedData.data,
        updatedAt: now,
      })
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        company: users.company,
        updatedAt: users.updatedAt,
      });

    if (!updatedUser.length) {
      throw createError({
        statusCode: 404,
        statusMessage: "Not Found: User does not exist.",
      });
    }

    // Return updated user data
    return {
      success: true,
      message: "User profile updated successfully",
      user: updatedUser[0],
    };
  } catch (error: any) {
    // If it's already a HTTP error, just re-throw it
    if (error.statusCode) {
      throw error;
    }

    console.error("Error updating user profile:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error: Could not update user profile.",
      data: error.message,
    });
  }
});

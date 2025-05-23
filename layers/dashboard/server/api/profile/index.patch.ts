import { defineEventHandler } from "h3";
import { getDb } from "~/server/utils/db";
import { users } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

// Validation schema for profile updates
const updateProfileSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  company: z.string().optional().nullable(),
});

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);
  if (!session?.user?.email) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const body = await readBody(event);
  const validation = updateProfileSchema.safeParse(body);
  if (!validation.success) {
    throw createError({
      statusCode: 400,
      statusMessage:
        "Invalid input: " +
        validation.error.errors.map((e) => e.message).join(", "),
    });
  }

  const db = getDb(event);

  try {
    // Update user profile
    const [updatedUser] = await db
      .update(users)
      .set({
        ...validation.data,
        updatedAt: new Date(),
      })
      .where(eq(users.email, session.user.email))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        company: users.company,
        avatarUrl: users.avatarUrl,
        updatedAt: users.updatedAt,
      });

    if (!updatedUser) {
      throw createError({ statusCode: 404, statusMessage: "User not found" });
    }

    return {
      success: true,
      user: updatedUser,
    };
  } catch (error) {
    console.error("Database Error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to update profile",
    });
  }
});

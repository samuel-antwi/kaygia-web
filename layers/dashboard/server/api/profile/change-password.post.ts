import { defineEventHandler } from "h3";
import { getDb } from "~/server/utils/db";
import { users } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import bcrypt from "bcrypt";

// Validation schema for password change
const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Password confirmation is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);
  if (!session?.user?.email) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const body = await readBody(event);
  const validation = changePasswordSchema.safeParse(body);
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
    // Get user with current password hash
    const user = await db.query.users.findFirst({
      where: eq(users.email, session.user.email),
      columns: { id: true, passwordHash: true },
    });

    if (!user || !user.passwordHash) {
      throw createError({ statusCode: 404, statusMessage: "User not found" });
    }

    // Verify current password
    const isValid = await bcrypt.compare(
      validation.data.currentPassword,
      user.passwordHash
    );
    if (!isValid) {
      throw createError({
        statusCode: 400,
        statusMessage: "Current password is incorrect",
      });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(validation.data.newPassword, 10);

    // Update password
    await db
      .update(users)
      .set({
        passwordHash: newPasswordHash,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    return {
      success: true,
      message: "Password updated successfully",
    };
  } catch (error) {
    console.error("Database Error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to change password",
    });
  }
});

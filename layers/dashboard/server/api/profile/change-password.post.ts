import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

// Define the expected payload type
interface ChangePasswordPayload {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export default defineEventHandler(async (event) => {
  try {
    // 1. Check user authentication
    const session = await getUserSession(event);
    if (!session || !session.user?.email) {
      throw createError({
        statusCode: 401,
        statusMessage: "Authentication required",
      });
    }

    // 2. Parse the request body
    const body = await readBody<ChangePasswordPayload>(event);

    // 3. Validate input
    if (!body.currentPassword || !body.newPassword || !body.confirmPassword) {
      throw createError({
        statusCode: 400,
        statusMessage: "All password fields are required.",
      });
    }

    if (body.newPassword.length < 8) {
      throw createError({
        statusCode: 400,
        statusMessage: "New password must be at least 8 characters long.",
      });
    }

    if (body.newPassword !== body.confirmPassword) {
      throw createError({
        statusCode: 400,
        statusMessage: "New passwords do not match.",
      });
    }

    const prisma = new PrismaClient();

    try {
      // 4. Fetch the user including their current password hash
      const user = await prisma.user.findUnique({
        where: {
          email: session.user.email,
        },
      });

      if (!user || !user.passwordHash) {
        // Should not happen if user is logged in via password, but handle defensively
        throw createError({
          statusCode: 404,
          statusMessage: "User not found or password not set.",
        });
      }

      // 5. Verify the current password
      const isCurrentPasswordValid = await bcrypt.compare(
        body.currentPassword,
        user.passwordHash
      );

      if (!isCurrentPasswordValid) {
        throw createError({
          statusCode: 400,
          statusMessage: "Incorrect current password.",
        });
      }

      // 6. Hash the new password
      const newPasswordHash = await bcrypt.hash(body.newPassword, 10); // Salt rounds = 10

      // 7. Update the user's password hash in the database
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          passwordHash: newPasswordHash,
        },
      });

      // 8. Return success response
      // No need to update session here as password isn't stored in session
      return {
        success: true,
        message: "Password updated successfully.",
      };
    } finally {
      // Ensure Prisma client is disconnected
      await prisma.$disconnect();
    }
  } catch (error: any) {
    console.error("Error changing password:", error);

    // Use createError for proper HTTP error handling
    if (!error.statusCode) {
      throw createError({
        statusCode: 500,
        statusMessage:
          error.message || "An error occurred while changing the password",
      });
    } else {
      throw error;
    }
  }
});

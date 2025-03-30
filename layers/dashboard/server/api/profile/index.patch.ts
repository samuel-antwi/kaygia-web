import { PrismaClient } from "@prisma/client";

// Define the expected payload type
interface ProfileUpdatePayload {
  name?: string;
  company?: string;
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
    const body = await readBody<ProfileUpdatePayload>(event);

    // 3. Validate the input (ensure name is not empty if provided)
    if (body.name !== undefined && !body.name.trim()) {
      throw createError({
        statusCode: 400,
        statusMessage: "Name cannot be empty",
      });
    }

    const prisma = new PrismaClient();

    try {
      // 4. Update the user in the database
      const updatedUser = await prisma.user.update({
        where: {
          email: session.user.email,
        },
        data: {
          name: body.name?.trim(), // Update name if provided
          company: body.company?.trim() || null, // Update company if provided, allow empty string to become null
        },
        // Select only the fields needed for the session/frontend update
        select: {
          id: true,
          name: true,
          email: true,
          company: true,
          role: true,
          emailVerified: true,
          lastLoggedIn: true,
        },
      });

      // 5. Update the user's session with the new data
      await setUserSession(event, {
        user: updatedUser,
        loggedInAt: Date.now(),
      });

      // 6. Return success response with updated user data
      return {
        success: true,
        user: updatedUser,
      };
    } finally {
      // Ensure Prisma client is disconnected
      await prisma.$disconnect();
    }
  } catch (error: any) {
    console.error("Error updating profile:", error);

    // Use createError for proper HTTP error handling
    if (!error.statusCode) {
      // If it's not already an HTTP error, wrap it
      throw createError({
        statusCode: 500,
        statusMessage:
          error.message || "An error occurred while updating the profile",
      });
    } else {
      // Re-throw if it's already an H3 error
      throw error;
    }
  }
});

import { PrismaClient } from "@prisma/client";
import { H3Event } from "h3";

// Initialize Prisma client
const prisma = new PrismaClient();

export default defineEventHandler(async (event: H3Event) => {
  try {
    // Get user session
    const session = await getUserSession(event);

    // Check if user is authenticated
    // When we set the session in login, we stored the email in the user object
    const userEmail = session?.user?.email;

    if (!userEmail || typeof userEmail !== "string") {
      return {
        success: false,
        error: "You must be logged in to access this resource",
      };
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: {
        // Include basic project information
        projects: {
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    // Return user data (including emailVerified)
    return {
      success: true,
      user: {
        ...user,
        emailVerified: user.emailVerified || false, // Ensure it has a default value
      },
    };
  } catch (error: any) {
    console.error("Profile fetch error:", error);

    // Return error
    return {
      success: false,
      error: "An error occurred while fetching user profile",
    };
  }
});

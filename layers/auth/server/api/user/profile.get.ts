import { H3Event } from "h3";
import { getDb } from "../../../../../server/utils/db";
import { users } from "../../../../../server/db/schema";
import { eq, and, isNull } from "drizzle-orm";

export default defineEventHandler(async (event: H3Event) => {
  try {
    const db = getDb(event);
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

    // Find user by email and explicitly select needed fields, excluding deleted users
    const user = await db.query.users.findFirst({
      where: and(
        eq(users.email, userEmail),
        isNull(users.deletedAt)
      ),
      columns: {
        id: true,
        email: true,
        name: true,
        company: true,
        avatarUrl: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        lastLoggedIn: true,
      },
    });

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    // Return explicitly selected user data
    return {
      success: true,
      user: user,
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

import { defineEventHandler } from "h3";
import { getDb } from "../../../../../../server/utils/db";
import { projects } from "../../../../../../server/db/schema";
import { hasAdminAccess } from "#layers/admin/utils/adminAccess";

export default defineEventHandler(async (event) => {
  // Get the user session
  const session = await getUserSession(event);
  const user = session?.user;

  // Verify admin role
  if (!user || !hasAdminAccess(user.role)) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden: Admin access required.",
    });
  }

  try {
    const db = getDb(event);

    // Fetch all projects with client info
    const projectsData = await db.query.projects.findMany({
      orderBy: (projects, { desc }) => [desc(projects.updatedAt)],
      with: {
        client: {
          columns: {
            id: true,
            name: true,
            email: true,
            company: true,
          },
        },
      },
    });

    return {
      success: true,
      projects: projectsData,
    };
  } catch (error: any) {
    console.error("[API][Admin] Error fetching projects:", error);

    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error: Could not fetch projects.",
      data: error.message,
    });
  }
});

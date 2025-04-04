import { defineEventHandler } from "h3";
import { getDb } from "~/server/utils/db";
import { projects, users } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);
  if (!session?.user?.email) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const db = getDb(event);

  try {
    // First get the user
    const user = await db.query.users.findFirst({
      where: eq(users.email, session.user.email),
      columns: { id: true },
    });

    if (!user) {
      throw createError({ statusCode: 404, statusMessage: "User not found" });
    }

    // Then get their projects
    const userProjects = await db.query.projects.findMany({
      where: eq(projects.clientId, user.id),
      orderBy: (projects, { desc }) => [desc(projects.createdAt)],
    });

    return {
      success: true,
      projects: userProjects,
    };
  } catch (error) {
    console.error("Database Error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch projects",
    });
  }
});

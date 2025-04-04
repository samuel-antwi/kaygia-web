import { defineEventHandler } from "h3";
import { getDb } from "~/server/utils/db";
import { projects, users } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import type {
  ProjectType,
  ProjectStatus,
} from "~/layers/dashboard/types/project";

// Validation schema for new project
const createProjectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  type: z.enum([
    "WEBSITE",
    "E_COMMERCE",
    "WEB_APP",
    "MOBILE_APP",
    "BRANDING",
    "MARKETING",
    "OTHER",
  ]),
  requirements: z.string().optional(),
});

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);
  if (!session?.user?.email) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const body = await readBody(event);
  const validation = createProjectSchema.safeParse(body);
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
    // First get the user
    const user = await db.query.users.findFirst({
      where: eq(users.email, session.user.email),
      columns: { id: true },
    });

    if (!user) {
      throw createError({ statusCode: 404, statusMessage: "User not found" });
    }

    // Create the project
    const now = new Date();
    const [newProject] = await db
      .insert(projects)
      .values({
        id: uuidv4(),
        title: validation.data.name,
        type: validation.data.type as ProjectType,
        status: "PENDING" as ProjectStatus,
        description: validation.data.description || null,
        requirements: validation.data.requirements || null,
        budget: null,
        clientId: user.id,
        createdAt: now,
        updatedAt: now,
        startDate: null,
        endDate: null,
      })
      .returning();

    return {
      success: true,
      project: newProject,
    };
  } catch (error) {
    console.error("Database Error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to create project",
    });
  }
});

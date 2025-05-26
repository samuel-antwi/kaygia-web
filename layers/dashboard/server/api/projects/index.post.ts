import { defineEventHandler } from "h3";
import { getDb } from "../../../../../server/utils/db";
import { projects, users, projectMilestones } from "../../../../../server/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import type {
  ProjectType,
  ProjectStatus,
} from "#layers/dashboard/types/project";
import { getProjectTemplate } from "../../../../../server/utils/project-phase-templates";

// Validation schema for new project
const createProjectSchema = z.object({
  title: z.string().min(1, "Project title is required"),
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
  budget: z.number().optional(),
  requirements: z.string().optional(),
});

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);
  if (!session?.user?.email) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const body = await readBody(event);
  console.log("Received project data:", body);
  const validation = createProjectSchema.safeParse(body);
  if (!validation.success) {
    console.log("Validation errors:", validation.error.errors);
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

    // Get the appropriate template based on project type
    const projectType = validation.data.type;
    const template = getProjectTemplate(projectType);
    const templateId = template?.id || projectType.toLowerCase();

    // Create the project
    const now = new Date();
    const projectId = uuidv4();
    const [newProject] = await db
      .insert(projects)
      .values({
        id: projectId,
        title: validation.data.title,
        type: validation.data.type as ProjectType,
        status: "PENDING" as ProjectStatus,
        description: validation.data.description || null,
        requirements: validation.data.requirements || null,
        budget: validation.data.budget || null,
        clientId: user.id,
        createdAt: now,
        updatedAt: now,
        startDate: null,
        endDate: null,
        phaseTemplate: templateId,
      })
      .returning();
      
    // If we have a template, create default milestones
    if (template) {
      const milestonesToCreate = [];
      let milestoneOrder = 0;
      
      for (const phase of template.phases) {
        if (phase.defaultMilestones) {
          for (const milestone of phase.defaultMilestones) {
            milestonesToCreate.push({
              id: uuidv4(),
              projectId: projectId,
              name: milestone.name,
              description: milestone.description,
              phase: phase.id,
              phaseOrder: phase.order,
              order: milestoneOrder++,
              status: 'pending' as const,
              weight: 1,
              createdAt: now,
              updatedAt: now,
            });
          }
        }
      }
      
      if (milestonesToCreate.length > 0) {
        await db.insert(projectMilestones).values(milestonesToCreate);
      }
    }

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

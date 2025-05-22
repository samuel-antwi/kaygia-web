import { defineEventHandler, getRouterParam, readBody } from "h3";
import { getDb } from "~/server/utils/db";
import { projects, projectDeliverables, users } from "~/server/db/schema";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

// Validation schema
const approvalSchema = z.object({
  action: z.enum(["approve", "reject"]),
  feedback: z.string().optional(),
});

export default defineEventHandler(async (event) => {
  try {
    const projectId = getRouterParam(event, "id");
    const deliverableId = getRouterParam(event, "deliverableId");
    
    if (!projectId || !deliverableId) {
      throw createError({ statusCode: 400, statusMessage: "Project ID and Deliverable ID are required" });
    }

    // Get the user session
    const session = await getUserSession(event);
    if (!session?.user) {
      throw createError({ statusCode: 401, statusMessage: "Authentication required" });
    }

    // Validate request body
    const body = await readBody(event);
    const validation = approvalSchema.safeParse(body);
    
    if (!validation.success) {
      throw createError({ 
        statusCode: 400, 
        statusMessage: "Invalid request data",
        data: validation.error.errors 
      });
    }

    // Initialize database connection
    const db = getDb(event);

    // Get the user
    const user = await db.query.users.findFirst({
      where: eq(users.email, session.user.email),
      columns: { id: true },
    });

    if (!user) {
      throw createError({ statusCode: 404, statusMessage: "User not found" });
    }

    // Verify project exists and user has access
    const project = await db.query.projects.findFirst({
      where: and(eq(projects.id, projectId), eq(projects.clientId, user.id)),
    });

    if (!project) {
      throw createError({ statusCode: 404, statusMessage: "Project not found" });
    }

    // Verify deliverable exists and belongs to project
    const deliverable = await db.query.projectDeliverables.findFirst({
      where: and(
        eq(projectDeliverables.id, deliverableId), 
        eq(projectDeliverables.projectId, projectId)
      ),
    });

    if (!deliverable) {
      throw createError({ statusCode: 404, statusMessage: "Deliverable not found" });
    }

    // Update deliverable status
    const newStatus = validation.data.action === "approve" ? "approved" : "rejected";
    const now = new Date();

    const [updatedDeliverable] = await db
      .update(projectDeliverables)
      .set({
        status: newStatus,
        approvedAt: validation.data.action === "approve" ? now : null,
        approvedBy: validation.data.action === "approve" ? user.id : null,
      })
      .where(eq(projectDeliverables.id, deliverableId))
      .returning();

    // TODO: Here you could add logic to:
    // - Send notification to project team
    // - Create project update entry
    // - Trigger workflow for next steps

    return {
      success: true,
      deliverable: {
        id: updatedDeliverable.id,
        status: updatedDeliverable.status,
        approvedAt: updatedDeliverable.approvedAt,
      },
      message: validation.data.action === "approve" 
        ? "Deliverable approved successfully" 
        : "Deliverable feedback submitted",
    };
  } catch (error: any) {
    console.error("Error updating deliverable approval:", error);
    
    if (error.statusCode) {
      throw error;
    }
    
    throw createError({ 
      statusCode: 500, 
      statusMessage: error.message || "Failed to update deliverable approval" 
    });
  }
});
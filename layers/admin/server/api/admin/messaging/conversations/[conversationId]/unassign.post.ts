import { eq } from 'drizzle-orm'
import { createError } from 'h3'
import { conversations } from '../../../../../../../../server/db/schema'
import { getDb } from '../../../../../../../../server/utils/db'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Super admin access required for team unassignment'
    })
  }

  const conversationId = getRouterParam(event, 'conversationId')
  if (!conversationId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Conversation ID is required'
    })
  }

  const db = getDb(event)

  // Verify the conversation exists
  const [conversation] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, conversationId))
    .limit(1)

  if (!conversation) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Conversation not found'
    })
  }

  // Update the conversation to remove the assigned team member
  await db
    .update(conversations)
    .set({
      createdBy: null,
      updatedAt: new Date()
    })
    .where(eq(conversations.id, conversationId))

  // Note: We don't remove the team member from participants
  // They may still need access to view the conversation history

  return {
    success: true,
    assignedTo: null
  }
})
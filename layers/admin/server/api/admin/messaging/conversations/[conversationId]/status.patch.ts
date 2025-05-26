import { z } from 'zod'
import { createError } from 'h3'
import { eq } from 'drizzle-orm'
import { conversations } from '../../../../../../../../server/db/schema'
import { getDb } from '../../../../../../../../server/utils/db'

const updateStatusSchema = z.object({
  status: z.enum(['active', 'archived', 'closed'])
})

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Admin access required'
    })
  }

  const conversationId = getRouterParam(event, 'conversationId')
  if (!conversationId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Conversation ID required'
    })
  }

  const body = await readValidatedBody(event, updateStatusSchema.parse)
  const db = getDb(event)

  // Check if conversation exists
  const conversation = await db.query.conversations.findFirst({
    where: eq(conversations.id, conversationId)
  })

  if (!conversation) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Conversation not found'
    })
  }

  // Update status
  const [updated] = await db
    .update(conversations)
    .set({
      status: body.status,
      updatedAt: new Date()
    })
    .where(eq(conversations.id, conversationId))
    .returning()

  return {
    conversation: updated
  }
})
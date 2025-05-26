import { eq, desc } from 'drizzle-orm'
import { createError } from 'h3'
import { messages, users, messageFiles } from '../../../../../../../../server/db/schema'
import { getDb } from '../../../../../../../../server/utils/db'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden'
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

  // Get messages with sender info and files
  const conversationMessages = await db.query.messages.findMany({
    where: eq(messages.conversationId, conversationId),
    orderBy: [desc(messages.createdAt)],
    with: {
      sender: {
        columns: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatarUrl: true
        }
      },
      files: true
    }
  })

  // Reverse to show oldest first
  conversationMessages.reverse()

  return {
    messages: conversationMessages,
    hasMore: false // TODO: Implement pagination
  }
})
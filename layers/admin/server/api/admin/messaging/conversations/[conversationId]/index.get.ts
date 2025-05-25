import { eq, sql } from 'drizzle-orm'
import { conversations, conversationParticipants, users, projects, messages } from '~/server/db/schema'
import { getDb } from '~/server/utils/db'

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

  // Get conversation with participants
  const conversation = await db.query.conversations.findFirst({
    where: eq(conversations.id, conversationId),
    with: {
      project: true,
      participants: {
        with: {
          user: {
            columns: {
              id: true,
              name: true,
              email: true,
              role: true,
              avatarUrl: true
            }
          }
        }
      }
    }
  })

  if (!conversation) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Conversation not found'
    })
  }

  // Get message count
  const messageCount = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .then(res => res[0]?.count || 0)

  // Get assigned team member if exists
  let assignedTo = null
  if (conversation.createdBy) {
    const assignedUser = await db.query.users.findFirst({
      where: eq(users.id, conversation.createdBy),
      columns: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    })
    assignedTo = assignedUser
  }

  return {
    conversation: {
      ...conversation,
      messageCount,
      assignedTo
    }
  }
})
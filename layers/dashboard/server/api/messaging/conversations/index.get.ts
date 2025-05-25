import { z } from 'zod'
import { eq, desc, and, or } from 'drizzle-orm'
import { conversations, conversationParticipants, messages, users, projects } from '~/server/db/schema'
import { getDb } from '~/server/utils/db'

const querySchema = z.object({
  projectId: z.string().optional(),
  status: z.enum(['active', 'archived', 'closed']).optional(),
  limit: z.string().transform(Number).default('10'),
  offset: z.string().transform(Number).default('0')
})

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  const query = await getValidatedQuery(event, querySchema.parse)
  const db = getDb(event)

  // Build query conditions
  const conditions = []
  
  // User must be a participant in the conversation
  conditions.push(
    eq(conversationParticipants.userId, session.user.id)
  )

  if (query.projectId) {
    conditions.push(eq(conversations.projectId, query.projectId))
  }

  if (query.status) {
    conditions.push(eq(conversations.status, query.status))
  }

  // Get conversations with last message
  const result = await db
    .select({
      conversation: conversations,
      project: {
        id: projects.id,
        name: projects.title,
        clientId: projects.clientId
      },
      participant: conversationParticipants,
      lastMessage: {
        id: messages.id,
        content: messages.content,
        senderId: messages.senderId,
        createdAt: messages.createdAt,
        senderName: users.name
      }
    })
    .from(conversations)
    .innerJoin(
      conversationParticipants,
      eq(conversations.id, conversationParticipants.conversationId)
    )
    .innerJoin(projects, eq(conversations.projectId, projects.id))
    .leftJoin(messages, eq(conversations.id, messages.conversationId))
    .leftJoin(users, eq(messages.senderId, users.id))
    .where(and(...conditions))
    .orderBy(desc(messages.createdAt))
    .limit(query.limit)
    .offset(query.offset)

  // Group by conversation and get the latest message for each
  const conversationMap = new Map()
  
  for (const row of result) {
    if (!conversationMap.has(row.conversation.id)) {
      conversationMap.set(row.conversation.id, {
        ...row.conversation,
        project: row.project,
        lastMessage: row.lastMessage?.id ? {
          ...row.lastMessage,
          sender: { name: row.lastMessage.senderName }
        } : null,
        unreadCount: 0 // TODO: Implement unread count
      })
    }
  }

  return {
    conversations: Array.from(conversationMap.values()),
    total: conversationMap.size
  }
})
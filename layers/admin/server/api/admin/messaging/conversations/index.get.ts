import { z } from 'zod'
import { eq, desc, and, or, like, sql, inArray, isNotNull } from 'drizzle-orm'
import { conversations, conversationParticipants, messages, users, projects } from '~/server/db/schema'
import { getDb } from '~/server/utils/db'

const querySchema = z.object({
  projectId: z.string().optional(),
  status: z.enum(['active', 'archived', 'closed']).optional(),
  search: z.string().optional(),
  limit: z.string().transform(Number).default('20'),
  offset: z.string().transform(Number).default('0')
})

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Admin access required'
    })
  }

  const query = await getValidatedQuery(event, querySchema.parse)
  const db = getDb(event)

  // Build query conditions
  const conditions = []

  if (query.projectId) {
    conditions.push(eq(conversations.projectId, query.projectId))
  }

  if (query.status) {
    conditions.push(eq(conversations.status, query.status))
  }

  if (query.search) {
    conditions.push(
      or(
        like(conversations.title, `%${query.search}%`),
        like(projects.title, `%${query.search}%`)
      )
    )
  }

  // Get all conversations with project and participant info
  const result = await db
    .select({
      conversation: conversations,
      project: projects,
      participantCount: sql<number>`count(distinct ${conversationParticipants.userId})`,
      messageCount: sql<number>`count(distinct ${messages.id})`,
      lastMessage: {
        id: messages.id,
        content: messages.content,
        senderId: messages.senderId,
        createdAt: messages.createdAt
      },
      lastMessageSender: {
        id: users.id,
        name: users.name,
        role: users.role
      }
    })
    .from(conversations)
    .innerJoin(projects, eq(conversations.projectId, projects.id))
    .leftJoin(
      conversationParticipants,
      eq(conversations.id, conversationParticipants.conversationId)
    )
    .leftJoin(messages, eq(conversations.id, messages.conversationId))
    .leftJoin(users, eq(messages.senderId, users.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .groupBy(
      conversations.id,
      projects.id,
      projects.title,
      projects.clientId,
      messages.id,
      messages.content,
      messages.senderId,
      messages.createdAt,
      users.id,
      users.name,
      users.role
    )
    .orderBy(desc(messages.createdAt))
    .limit(query.limit)
    .offset(query.offset)

  // Get total count
  const [{ count }] = await db
    .select({ count: sql<number>`count(distinct ${conversations.id})` })
    .from(conversations)
    .innerJoin(projects, eq(conversations.projectId, projects.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)

  // Process results to get unique conversations with their latest message
  const conversationMap = new Map()
  
  for (const row of result) {
    const convId = row.conversation.id
    if (!conversationMap.has(convId) || 
        (row.lastMessage?.createdAt && 
         (!conversationMap.get(convId).lastMessage?.createdAt ||
          row.lastMessage.createdAt > conversationMap.get(convId).lastMessage.createdAt))) {
      conversationMap.set(convId, {
        ...row.conversation,
        project: row.project,
        participantCount: Number(row.participantCount),
        messageCount: Number(row.messageCount),
        lastMessage: row.lastMessage?.id ? {
          ...row.lastMessage,
          sender: row.lastMessageSender
        } : null
      })
    }
  }

  // Get assigned team members for conversations
  const conversationIds = Array.from(conversationMap.keys())
  const assignedMembers = await db
    .select({
      conversationId: conversations.id,
      assignedTo: {
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role
      }
    })
    .from(conversations)
    .innerJoin(users, eq(conversations.createdBy, users.id))
    .where(
      conversationIds.length > 0
        ? and(
            inArray(conversations.id, conversationIds),
            isNotNull(conversations.createdBy)
          )
        : undefined
    )

  // Map assigned members to conversations
  const assignmentMap = new Map(
    assignedMembers.map(row => [row.conversationId, row.assignedTo])
  )

  // Add assigned team members to conversations
  const conversationsWithAssignees = Array.from(conversationMap.values()).map(conv => ({
    ...conv,
    assignedTo: assignmentMap.get(conv.id) || null
  }))

  return {
    conversations: conversationsWithAssignees,
    total: Number(count)
  }
})
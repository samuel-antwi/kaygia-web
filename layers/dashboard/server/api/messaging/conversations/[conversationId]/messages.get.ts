import { z } from 'zod'
import { eq, desc, and, lte } from 'drizzle-orm'
import { messages, users, conversationParticipants, messageReadReceipts, messageFiles } from '../../../../../../../server/db/schema'
import { getDb } from '../../../../../../../server/utils/db'

const querySchema = z.object({
  limit: z.string().transform(Number).default('50'),
  before: z.string().optional() // For pagination - get messages before this timestamp
})

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  const conversationId = getRouterParam(event, 'conversationId')
  if (!conversationId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Conversation ID required'
    })
  }

  const query = await getValidatedQuery(event, querySchema.parse)
  const db = getDb(event)

  // Verify user is participant
  const participant = await db.query.conversationParticipants.findFirst({
    where: and(
      eq(conversationParticipants.conversationId, conversationId),
      eq(conversationParticipants.userId, session.user.id)
    )
  })

  if (!participant) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Not a participant in this conversation'
    })
  }

  // Build query conditions
  const conditions = [eq(messages.conversationId, conversationId)]
  
  if (query.before) {
    conditions.push(lte(messages.createdAt, new Date(query.before)))
  }

  // Get messages with sender info and files
  const result = await db
    .select({
      message: messages,
      sender: {
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role
      },
      readBy: messageReadReceipts,
      files: messageFiles
    })
    .from(messages)
    .innerJoin(users, eq(messages.senderId, users.id))
    .leftJoin(messageReadReceipts, eq(messages.id, messageReadReceipts.messageId))
    .leftJoin(messageFiles, eq(messages.id, messageFiles.messageId))
    .where(and(...conditions))
    .orderBy(desc(messages.createdAt))
    .limit(query.limit)

  // Group messages with their files and read receipts
  const messageMap = new Map()
  
  for (const row of result) {
    if (!messageMap.has(row.message.id)) {
      messageMap.set(row.message.id, {
        ...row.message,
        sender: row.sender,
        files: [],
        readBy: [],
        isOwn: row.sender.id === session.user.id
      })
    }
    
    const message = messageMap.get(row.message.id)
    
    if (row.files && row.files.id && !message.files.find((f: any) => f.id === row.files!.id)) {
      message.files.push(row.files)
    }
    
    if (row.readBy && row.readBy.userId && !message.readBy.find((r: any) => r.userId === row.readBy!.userId)) {
      message.readBy.push(row.readBy)
    }
  }

  // Update last read time for this user
  await db
    .update(conversationParticipants)
    .set({ lastReadAt: new Date() })
    .where(
      and(
        eq(conversationParticipants.conversationId, conversationId),
        eq(conversationParticipants.userId, session.user.id)
      )
    )

  return {
    messages: Array.from(messageMap.values()).reverse(), // Reverse to get chronological order
    hasMore: result.length === query.limit
  }
})
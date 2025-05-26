import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { messages, conversationParticipants, conversations, users } from '../../../../../../../server/db/schema'
import { getDb } from '../../../../../../../server/utils/db'
import { nanoid } from 'nanoid'

const sendMessageSchema = z.object({
  content: z.string().min(1).max(10000),
  type: z.enum(['text', 'file', 'system']).default('text'),
  metadata: z.record(z.any()).optional(),
  fileIds: z.array(z.string()).optional()
})

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session.user) {
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

  const body = await readValidatedBody(event, sendMessageSchema.parse)
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

  // Check if conversation is active
  const conversation = await db.query.conversations.findFirst({
    where: eq(conversations.id, conversationId)
  })

  if (!conversation || conversation.status !== 'active') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Conversation is not active'
    })
  }

  // Create message
  const messageId = nanoid()
  
  const [newMessage] = await db
    .insert(messages)
    .values({
      id: messageId,
      conversationId,
      senderId: session.user.id,
      content: body.content,
      type: body.type,
      metadata: body.metadata || {}
    })
    .returning()

  // Get sender info for response
  const sender = await db.query.users.findFirst({
    where: eq(users.id, session.user!.id),
    columns: {
      id: true,
      name: true,
      email: true,
      role: true
    }
  })

  // Update conversation's updated_at
  await db
    .update(conversations)
    .set({ updatedAt: new Date() })
    .where(eq(conversations.id, conversationId))

  // Send real-time notification via WebSocket
  const { websocketEvents } = await import('../../../../../../../server/utils/websocket')
  const messageWithSender = {
    ...newMessage,
    sender,
    files: [],
    readBy: [],
    isOwn: false // Will be set correctly on client side
  }
  websocketEvents.emitNewMessage(conversationId, messageWithSender)

  // TODO: Handle file attachments if fileIds provided

  return {
    message: {
      ...newMessage,
      sender,
      files: [],
      readBy: [],
      isOwn: true
    }
  }
})
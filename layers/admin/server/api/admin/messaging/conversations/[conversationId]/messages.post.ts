import { z } from 'zod'
import { createError } from 'h3'
import { eq, and } from 'drizzle-orm'
import { messages, conversations, conversationParticipants } from '../../../../../../../../server/db/schema'
import { getDb } from '../../../../../../../../server/utils/db'
import { nanoid } from 'nanoid'

const sendMessageSchema = z.object({
  content: z.string().min(1).max(5000),
  files: z.array(z.object({
    id: z.string(),
    url: z.string(),
    name: z.string(),
    size: z.number(),
    type: z.string()
  })).optional()
})

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

  const body = await readValidatedBody(event, sendMessageSchema.parse)
  const db = getDb(event)

  // Verify conversation exists
  const conversation = await db.query.conversations.findFirst({
    where: eq(conversations.id, conversationId)
  })

  if (!conversation) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Conversation not found'
    })
  }

  // Check if admin is a participant (add them if not)
  const isParticipant = await db.query.conversationParticipants.findFirst({
    where: and(
      eq(conversationParticipants.conversationId, conversationId),
      eq(conversationParticipants.userId, session.user.id)
    )
  })

  if (!isParticipant) {
    // Add admin as participant
    await db.insert(conversationParticipants).values({
      conversationId,
      userId: session.user.id,
      role: 'member'
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
      content: body.content
    })
    .returning()

  // TODO: Handle file attachments if provided
  // TODO: Send real-time notification via WebSocket/Supabase

  // Update conversation's updatedAt
  await db
    .update(conversations)
    .set({ updatedAt: new Date() })
    .where(eq(conversations.id, conversationId))

  return {
    message: newMessage
  }
})
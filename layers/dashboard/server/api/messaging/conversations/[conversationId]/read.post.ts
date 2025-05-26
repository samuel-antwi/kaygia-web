import { z } from 'zod'
import { eq, and, inArray } from 'drizzle-orm'
import { messageReadReceipts, messages, conversationParticipants } from '../../../../../../../server/db/schema'
import { getDb } from '../../../../../../../server/utils/db'

const markReadSchema = z.object({
  messageIds: z.array(z.string())
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

  const body = await readValidatedBody(event, markReadSchema.parse)
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

  // Verify messages belong to this conversation
  const validMessages = await db.query.messages.findMany({
    where: and(
      eq(messages.conversationId, conversationId),
      inArray(messages.id, body.messageIds)
    )
  })

  if (validMessages.length === 0) {
    return { marked: 0 }
  }

  // Create read receipts (ignore conflicts)
  const readReceipts = validMessages.map(msg => ({
    messageId: msg.id,
    userId: session.user!.id,
    readAt: new Date()
  }))

  await db
    .insert(messageReadReceipts)
    .values(readReceipts)
    .onConflictDoNothing()

  // Update participant's last read time
  await db
    .update(conversationParticipants)
    .set({ lastReadAt: new Date() })
    .where(
      and(
        eq(conversationParticipants.conversationId, conversationId),
        eq(conversationParticipants.userId, session.user!.id)
      )
    )

  return {
    marked: validMessages.length
  }
})
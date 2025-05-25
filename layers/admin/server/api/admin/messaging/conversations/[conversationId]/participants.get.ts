import { eq } from 'drizzle-orm'
import { conversationParticipants, users } from '~/server/db/schema'
import { getDb } from '~/server/utils/db'

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

  const db = getDb(event)

  // Get all participants with user info
  const participants = await db
    .select({
      participant: conversationParticipants,
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        active: users.active
      }
    })
    .from(conversationParticipants)
    .innerJoin(users, eq(conversationParticipants.userId, users.id))
    .where(eq(conversationParticipants.conversationId, conversationId))

  return {
    participants: participants.map(p => ({
      ...p.participant,
      user: p.user
    }))
  }
})
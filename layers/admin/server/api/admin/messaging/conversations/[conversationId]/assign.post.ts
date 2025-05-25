import { z } from 'zod'
import { eq, and, isNull } from 'drizzle-orm'
import { conversations, users, conversationParticipants } from '~/server/db/schema'
import { getDb } from '~/server/utils/db'

const bodySchema = z.object({
  teamMemberId: z.string()
})

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Super admin access required for team assignment'
    })
  }

  const conversationId = getRouterParam(event, 'conversationId')
  if (!conversationId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Conversation ID is required'
    })
  }

  const body = await readValidatedBody(event, bodySchema.parse)
  const db = getDb(event)

  // Verify the conversation exists
  const [conversation] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, conversationId))
    .limit(1)

  if (!conversation) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Conversation not found'
    })
  }

  // Verify the team member exists and is an admin
  const [teamMember] = await db
    .select()
    .from(users)
    .where(
      and(
        eq(users.id, body.teamMemberId),
        isNull(users.deletedAt)
      )
    )
    .limit(1)

  if (!teamMember || (teamMember.role !== 'ADMIN' && teamMember.role !== 'SUPER_ADMIN')) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid team member'
    })
  }

  // Update the conversation with the assigned team member
  await db
    .update(conversations)
    .set({
      createdBy: body.teamMemberId,
      updatedAt: new Date()
    })
    .where(eq(conversations.id, conversationId))

  // Add the team member as a participant if not already
  const existingParticipant = await db
    .select()
    .from(conversationParticipants)
    .where(
      and(
        eq(conversationParticipants.conversationId, conversationId),
        eq(conversationParticipants.userId, body.teamMemberId)
      )
    )
    .limit(1)

  if (!existingParticipant.length) {
    await db
      .insert(conversationParticipants)
      .values({
        conversationId,
        userId: body.teamMemberId,
        role: 'admin',
        joinedAt: new Date()
      })
  }

  return {
    success: true,
    assignedTo: {
      id: teamMember.id,
      name: teamMember.name,
      email: teamMember.email,
      role: teamMember.role
    }
  }
})
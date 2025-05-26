import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { conversations, conversationParticipants, projects } from '../../../../../../server/db/schema'
import { getDb } from '../../../../../../server/utils/db'
import { nanoid } from 'nanoid'

const createConversationSchema = z.object({
  projectId: z.string(),
  title: z.string().optional(),
  type: z.enum(['project', 'support', 'general']).default('project'),
  participantIds: z.array(z.string()).optional()
})

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  const body = await readValidatedBody(event, createConversationSchema.parse)
  const db = getDb(event)

  // Verify user has access to the project
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, body.projectId)
  })

  if (!project || project.clientId !== session.user.id) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden'
    })
  }

  // Create conversation
  const conversationId = nanoid()
  
  const [newConversation] = await db
    .insert(conversations)
    .values({
      id: conversationId,
      projectId: body.projectId,
      title: body.title || `${project.title} Conversation`,
      type: body.type,
      createdBy: session.user.id
    })
    .returning()

  // Add creator as participant
  await db.insert(conversationParticipants).values({
    conversationId: conversationId,
    userId: session.user.id,
    role: 'owner' as const
  })

  // Add additional participants if provided
  if (body.participantIds && body.participantIds.length > 0) {
    const participantValues = body.participantIds.map(userId => ({
      conversationId: conversationId,
      userId,
      role: 'member' as const
    }))
    
    await db.insert(conversationParticipants).values(participantValues)
  }

  return {
    conversation: newConversation
  }
})
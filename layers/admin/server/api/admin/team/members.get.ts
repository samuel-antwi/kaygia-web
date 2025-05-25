import { z } from 'zod'
import { eq, sql, and, or, isNull } from 'drizzle-orm'
import { users, conversations, conversationParticipants } from '~/server/db/schema'
import { getDb } from '~/server/utils/db'

const querySchema = z.object({
  includeStats: z.string().transform(val => val === 'true').optional()
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

  // Get all admin and super admin users
  const teamMembers = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      assignedCount: query.includeStats
        ? sql<number>`(
            SELECT COUNT(DISTINCT c.id)
            FROM ${conversations} c
            WHERE c.created_by = ${users.id}
              AND c.status = 'active'
          )`
        : sql<number>`0`
    })
    .from(users)
    .where(
      and(
        or(
          eq(users.role, 'ADMIN'),
          eq(users.role, 'SUPER_ADMIN')
        ),
        isNull(users.deletedAt)
      )
    )
    .orderBy(users.name)

  return {
    members: teamMembers.map(member => ({
      ...member,
      assignedCount: Number(member.assignedCount)
    }))
  }
})
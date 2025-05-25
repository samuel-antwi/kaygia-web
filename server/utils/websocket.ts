import { Server as SocketIOServer, Socket } from 'socket.io'
import { Server as HttpServer } from 'http'
import { redis } from './redis'
import { getDb } from './db'
import { conversationParticipants } from '../db/schema'
import { eq, and } from 'drizzle-orm'

interface AuthenticatedSocket extends Socket {
  userId?: string
  user?: {
    id: string
    name: string | null
    email: string
    role: string
  }
}

interface SocketWithAuth extends Socket {
  userId: string
  user: {
    id: string
    name: string | null
    email: string
    role: string
  }
}

let io: SocketIOServer | null = null

export function initializeWebSocket(server: HttpServer) {
  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? ['https://yourdomain.com'] 
        : ['http://localhost:3000', 'http://localhost:3001'],
      credentials: true
    },
    transports: ['websocket', 'polling']
  })

  // Simplified authentication middleware for development
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      // For now, use a simple token check - TODO: Implement proper JWT
      const token = socket.handshake.auth.token
      
      if (!token) {
        return next(new Error('Authentication token required'))
      }

      // TODO: Replace with proper user authentication
      // For development, we'll set a default user
      socket.userId = 'temp-user-id'
      socket.user = {
        id: 'temp-user-id',
        name: 'Development User',
        email: 'dev@example.com',
        role: 'CLIENT'
      }
      next()
    } catch (error) {
      console.error('WebSocket authentication error:', error)
      next(new Error('Authentication failed'))
    }
  })

  io.on('connection', async (socket: any) => {
    console.log(`User ${socket.user.name} connected: ${socket.id}`)

    // Set user online status
    await redis.setUserOnline(socket.userId, socket.id)

    // Join user to their personal room
    await socket.join(`user:${socket.userId}`)

    // Handle joining conversations
    socket.on('join-conversation', async (conversationId: string) => {
      try {
        // Verify user is participant in conversation
        const db = getDb({} as any) // Temporary fix for event parameter
        const participant = await db.query.conversationParticipants.findFirst({
          where: and(
            eq(conversationParticipants.conversationId, conversationId),
            eq(conversationParticipants.userId, socket.userId)
          )
        })

        if (!participant) {
          socket.emit('error', { message: 'Not authorized to join this conversation' })
          return
        }

        await socket.join(`conversation:${conversationId}`)
        await redis.addUserToConversation(conversationId, socket.userId, socket.id)

        // Notify other participants
        socket.to(`conversation:${conversationId}`).emit('user-joined', {
          userId: socket.userId,
          user: socket.user
        })

        // Send conversation participants to the joining user
        const conversationUsers = await redis.getConversationUsers(conversationId)
        socket.emit('conversation-participants', {
          conversationId,
          participants: conversationUsers
        })

      } catch (error) {
        console.error('Error joining conversation:', error)
        socket.emit('error', { message: 'Failed to join conversation' })
      }
    })

    // Handle leaving conversations
    socket.on('leave-conversation', async (conversationId: string) => {
      await socket.leave(`conversation:${conversationId}`)
      await redis.removeUserFromConversation(conversationId, socket.userId)

      socket.to(`conversation:${conversationId}`).emit('user-left', {
        userId: socket.userId,
        user: socket.user
      })
    })

    // Handle typing indicators
    socket.on('typing-start', (data: { conversationId: string }) => {
      socket.to(`conversation:${data.conversationId}`).emit('user-typing', {
        userId: socket.userId,
        user: socket.user,
        conversationId: data.conversationId
      })
    })

    socket.on('typing-stop', (data: { conversationId: string }) => {
      socket.to(`conversation:${data.conversationId}`).emit('user-stopped-typing', {
        userId: socket.userId,
        conversationId: data.conversationId
      })
    })

    // Handle message read receipts
    socket.on('message-read', async (data: { messageId: string, conversationId: string }) => {
      socket.to(`conversation:${data.conversationId}`).emit('message-read', {
        messageId: data.messageId,
        userId: socket.userId,
        readAt: new Date().toISOString()
      })
    })

    // Handle disconnection
    socket.on('disconnect', async () => {
      console.log(`User ${socket.user.name} disconnected: ${socket.id}`)
      
      // Set user offline
      await redis.setUserOffline(socket.userId)

      // Remove from all conversations
      const rooms = Array.from(socket.rooms) as string[]
      const conversationRooms = rooms
        .filter(room => room.startsWith('conversation:'))
        .map(room => room.replace('conversation:', ''))

      for (const conversationId of conversationRooms) {
        await redis.removeUserFromConversation(conversationId, socket.userId)
        socket.to(`conversation:${conversationId}`).emit('user-left', {
          userId: socket.userId,
          user: socket.user
        })
      }

      // Notify user's contacts they went offline
      io?.to(`user:${socket.userId}`).emit('user-offline', {
        userId: socket.userId,
        lastSeen: new Date().toISOString()
      })
    })
  })

  return io
}

export function getWebSocketServer() {
  return io
}

// Helper functions for emitting events from API routes
export const websocketEvents = {
  // Emit new message to conversation participants
  emitNewMessage: (conversationId: string, message: any) => {
    if (!io) return
    io.to(`conversation:${conversationId}`).emit('new-message', message)
  },

  // Emit message updated event
  emitMessageUpdated: (conversationId: string, message: any) => {
    if (!io) return
    io.to(`conversation:${conversationId}`).emit('message-updated', message)
  },

  // Emit message deleted event
  emitMessageDeleted: (conversationId: string, messageId: string) => {
    if (!io) return
    io.to(`conversation:${conversationId}`).emit('message-deleted', { messageId })
  },

  // Emit conversation status updated
  emitConversationUpdated: (conversationId: string, updates: any) => {
    if (!io) return
    io.to(`conversation:${conversationId}`).emit('conversation-updated', {
      conversationId,
      updates
    })
  },

  // Emit user status change
  emitUserStatusChange: (userId: string, status: 'online' | 'offline', lastSeen?: string) => {
    if (!io) return
    io.emit('user-status-change', {
      userId,
      status,
      lastSeen: lastSeen || new Date().toISOString()
    })
  },

  // Send notification to specific user
  sendNotificationToUser: (userId: string, notification: any) => {
    if (!io) return
    io.to(`user:${userId}`).emit('notification', notification)
  }
}
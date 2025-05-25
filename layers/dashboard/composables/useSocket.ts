import { io, Socket } from 'socket.io-client'
import type { Message } from '../types/messaging'
import { useMessagingStore } from '../stores/messagingStore'

interface ServerToClientEvents {
  'new-message': (message: Message) => void
  'message-updated': (message: Message) => void
  'message-deleted': (data: { messageId: string }) => void
  'message-read': (data: { messageId: string, userId: string, readAt: string }) => void
  'user-joined': (data: { userId: string, user: any }) => void
  'user-left': (data: { userId: string, user: any }) => void
  'user-typing': (data: { userId: string, user: any, conversationId: string }) => void
  'user-stopped-typing': (data: { userId: string, conversationId: string }) => void
  'conversation-updated': (data: { conversationId: string, updates: any }) => void
  'conversation-participants': (data: { conversationId: string, participants: string[] }) => void
  'user-status-change': (data: { userId: string, status: 'online' | 'offline', lastSeen: string }) => void
  'notification': (notification: any) => void
  'error': (data: { message: string }) => void
}

interface ClientToServerEvents {
  'join-conversation': (conversationId: string) => void
  'leave-conversation': (conversationId: string) => void
  'typing-start': (data: { conversationId: string }) => void
  'typing-stop': (data: { conversationId: string }) => void
  'message-read': (data: { messageId: string, conversationId: string }) => void
}

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null
const isConnected = ref(false)

export const useSocket = () => {
  const { user } = useUserState()
  const messagingStore = useMessagingStore()
  const config = useRuntimeConfig()
  
  const connect = async () => {
    if (socket?.connected || !user.value) return socket

    // Development mode: simulate connection for UI testing
    if (import.meta.dev) {
      console.log('Development mode: Simulating WebSocket connection')
      isConnected.value = true
      return null
    }

    try {
      // Get the session data for authentication
      const session = await $fetch('/api/user/profile')
      
      socket = io(config.public.NUXT_PUBLIC_SITE_URL, {
        auth: {
          token: 'temp-token' // TODO: Implement proper JWT token
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
      })

      socket.on('connect', () => {
        console.log('Connected to WebSocket server')
        isConnected.value = true
      })

      socket.on('disconnect', () => {
        console.log('Disconnected from WebSocket server')
        isConnected.value = false
      })

      socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error)
      })

      // Message events
      socket.on('new-message', (message: Message) => {
        console.log('New message received:', message)
        messagingStore.addMessage(message)
      })

      socket.on('message-updated', (message: Message) => {
        messagingStore.updateMessageStatus(message.id, message)
      })

      socket.on('message-deleted', ({ messageId }) => {
        messagingStore.updateMessageStatus(messageId, { deletedAt: new Date() })
      })

      socket.on('message-read', ({ messageId, userId, readAt }) => {
        // Update message read receipts
        const message = messagingStore.messages.find((m: Message) => m.id === messageId)
        if (message) {
          if (!message.readBy) message.readBy = []
          const existingReceipt = message.readBy.find((r: any) => r.userId === userId)
          if (!existingReceipt) {
            message.readBy.push({
              messageId,
              userId,
              readAt: new Date(readAt)
            })
          }
        }
      })

      // User presence events
      socket.on('user-joined', ({ user: userData }) => {
        console.log(`User ${userData.name} joined conversation`)
      })

      socket.on('user-left', ({ user: userData }) => {
        console.log(`User ${userData.name} left conversation`)
      })

      socket.on('user-typing', ({ user: userData, conversationId }) => {
        // Handle typing indicators
        console.log(`${userData.name} is typing in conversation ${conversationId}`)
      })

      socket.on('user-stopped-typing', ({ conversationId }) => {
        // Handle stop typing
        console.log(`User stopped typing in conversation ${conversationId}`)
      })

      socket.on('conversation-updated', ({ conversationId, updates }) => {
        // Update conversation in store
        const conversation = messagingStore.conversations.find((c: any) => c.id === conversationId)
        if (conversation) {
          Object.assign(conversation, updates)
        }
      })

      socket.on('user-status-change', ({ userId, status }) => {
        console.log(`User ${userId} is now ${status}`)
        // Update user status in UI
      })

      socket.on('notification', (notification) => {
        console.log('Received notification:', notification)
        // Handle notifications (could show toast, update badge, etc.)
      })

      socket.on('error', ({ message }) => {
        console.error('WebSocket error:', message)
      })

      return socket
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error)
      return null
    }
  }

  const disconnect = () => {
    if (socket) {
      socket.disconnect()
      socket = null
      isConnected.value = false
    }
  }

  const joinConversation = (conversationId: string) => {
    if (socket?.connected) {
      socket.emit('join-conversation', conversationId)
    }
  }

  const leaveConversation = (conversationId: string) => {
    if (socket?.connected) {
      socket.emit('leave-conversation', conversationId)
    }
  }

  const startTyping = (conversationId: string) => {
    if (socket?.connected) {
      socket.emit('typing-start', { conversationId })
    }
  }

  const stopTyping = (conversationId: string) => {
    if (socket?.connected) {
      socket.emit('typing-stop', { conversationId })
    }
  }

  const markMessageAsRead = (messageId: string, conversationId: string) => {
    if (socket?.connected) {
      socket.emit('message-read', { messageId, conversationId })
    }
  }

  // Auto-connect when user logs in
  watch(user, async (newUser) => {
    if (newUser && !isConnected.value) {
      await connect()
    } else if (!newUser && isConnected.value) {
      disconnect()
    }
  }, { immediate: true })

  // Cleanup on unmount
  onUnmounted(() => {
    disconnect()
  })

  return {
    socket: readonly(ref(socket)),
    isConnected: readonly(isConnected),
    connect,
    disconnect,
    joinConversation,
    leaveConversation,
    startTyping,
    stopTyping,
    markMessageAsRead
  }
}
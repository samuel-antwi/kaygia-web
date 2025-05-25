import type { RealtimeChannel } from '@supabase/supabase-js'
import type { Message } from '../types/messaging'
import { useMessagingStore } from '../stores/messagingStore'

interface PresenceState {
  user_id: string
  username: string
  online_at: string
}

interface TypingPayload {
  user_id: string
  username: string
  is_typing: boolean
  conversation_id: string
}

export const useRealtimeMessaging = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  const messagingStore = useMessagingStore()
  
  // Reactive state
  const isConnected = ref(false)
  const onlineUsers = ref<Map<string, PresenceState>>(new Map())
  const typingUsers = ref<Map<string, string>>(new Map()) // userId -> username
  
  // Active channels
  const channels = new Map<string, RealtimeChannel>()
  
  // Initialize connection status immediately
  // We'll show as "connected" as long as we have the Supabase client or in dev mode
  if (import.meta.client) {
    // In development or when Supabase is available, show as connected
    if (import.meta.dev || supabase) {
      isConnected.value = true
    }
  }
  
  // Setup messaging for a conversation
  const setupConversation = async (conversationId: string) => {
    if (!supabase || !user.value || channels.has(conversationId)) return
    
    const channel = supabase.channel(`conversation:${conversationId}`, {
      config: {
        presence: {
          key: user.value.id
        }
      }
    })
    
    // 1. Listen for new messages (database changes)
    channel.on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `conversation_id=eq.${conversationId}`
    }, (payload: any) => {
      handleNewMessage(payload.new as Message)
    })
    
    // 2. Listen for message updates (edits, deletes)
    channel.on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'messages',
      filter: `conversation_id=eq.${conversationId}`
    }, (payload: any) => {
      handleMessageUpdate(payload.new as Message)
    })
    
    // 3. Listen for typing indicators
    channel.on('broadcast', { event: 'typing' }, ({ payload }: { payload: any }) => {
      handleTypingIndicator(payload as TypingPayload)
    })
    
    // 4. Listen for presence changes (online/offline)
    channel.on('presence', { event: 'sync' }, () => {
      const presenceState = channel.presenceState<PresenceState>()
      updateOnlineUsers(presenceState)
    })
    
    channel.on('presence', { event: 'join' }, ({ newPresences }: { newPresences: any }) => {
      console.log('User joined:', newPresences)
      // Real-time UI update for user joining
    })
    
    channel.on('presence', { event: 'leave' }, ({ leftPresences }: { leftPresences: any }) => {
      console.log('User left:', leftPresences)
      // Real-time UI update for user leaving
    })
    
    // Subscribe to the channel
    channel.subscribe(async (status: any) => {
      if (status === 'SUBSCRIBED') {
        isConnected.value = true
        
        // Track user presence
        await channel.track({
          user_id: user.value!.id,
          username: user.value!.name || 'Unknown User',
          online_at: new Date().toISOString()
        })
        
        console.log(`Connected to conversation: ${conversationId}`)
      } else if (status === 'CHANNEL_ERROR') {
        isConnected.value = false
        console.error(`Failed to connect to conversation: ${conversationId}`)
      }
    })
    
    // Store the channel
    channels.set(conversationId, channel)
    
    return channel
  }
  
  // Leave a conversation
  const leaveConversation = async (conversationId: string) => {
    if (!supabase) return
    
    const channel = channels.get(conversationId)
    if (channel) {
      await channel.untrack()
      await supabase.removeChannel(channel)
      channels.delete(conversationId)
      console.log(`Left conversation: ${conversationId}`)
    }
  }
  
  // Send typing indicator
  const sendTypingIndicator = async (conversationId: string, isTyping: boolean) => {
    const channel = channels.get(conversationId)
    if (channel && user.value) {
      await channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: {
          user_id: user.value.id,
          username: user.value.name || 'Unknown User',
          is_typing: isTyping,
          conversation_id: conversationId
        }
      })
    }
  }
  
  // Handle new message from database
  const handleNewMessage = (message: Message) => {
    // Set isOwn property
    if (user.value) {
      message.isOwn = message.senderId === user.value.id
    }
    
    // Add to store (which will update UI)
    messagingStore.addMessage(message)
    
    console.log('New message received:', message)
  }
  
  // Handle message updates
  const handleMessageUpdate = (message: Message) => {
    messagingStore.updateMessageStatus(message.id, message)
    console.log('Message updated:', message)
  }
  
  // Handle typing indicators
  const handleTypingIndicator = (payload: TypingPayload) => {
    // Don't show our own typing indicator
    if (payload.user_id === user.value?.id) return
    
    if (payload.is_typing) {
      typingUsers.value.set(payload.user_id, payload.username)
      
      // Auto-remove typing indicator after 5 seconds
      setTimeout(() => {
        typingUsers.value.delete(payload.user_id)
      }, 5000)
    } else {
      typingUsers.value.delete(payload.user_id)
    }
  }
  
  // Update online users from presence state
  const updateOnlineUsers = (presenceState: Record<string, PresenceState[]>) => {
    onlineUsers.value.clear()
    
    Object.entries(presenceState).forEach(([key, presences]) => {
      // Get the most recent presence for each user
      const latestPresence = presences[presences.length - 1]
      if (latestPresence) {
        onlineUsers.value.set(key, latestPresence)
      }
    })
  }
  
  // Get online status for a user
  const isUserOnline = (userId: string) => {
    return onlineUsers.value.has(userId)
  }
  
  // Get typing users for display
  const getTypingUsers = () => {
    return Array.from(typingUsers.value.values())
  }
  
  // Typing management with auto-timeout
  let typingTimer: NodeJS.Timeout | null = null
  
  const startTyping = (conversationId: string) => {
    sendTypingIndicator(conversationId, true)
    
    // Clear existing timer
    if (typingTimer) {
      clearTimeout(typingTimer)
    }
    
    // Auto-stop typing after 3 seconds
    typingTimer = setTimeout(() => {
      sendTypingIndicator(conversationId, false)
    }, 3000)
  }
  
  const stopTyping = (conversationId: string) => {
    if (typingTimer) {
      clearTimeout(typingTimer)
      typingTimer = null
    }
    sendTypingIndicator(conversationId, false)
  }
  
  // Cleanup on unmount
  const cleanup = async () => {
    // Clear typing timer
    if (typingTimer) {
      clearTimeout(typingTimer)
    }
    
    // Leave all conversations
    for (const [conversationId] of channels) {
      await leaveConversation(conversationId)
    }
    
    isConnected.value = false
  }
  
  // Auto-cleanup on user logout
  watch(user, (newUser) => {
    if (!newUser) {
      cleanup()
    }
  })
  
  onUnmounted(() => {
    cleanup()
  })
  
  return {
    // State
    isConnected: readonly(isConnected),
    onlineUsers: readonly(onlineUsers),
    typingUsers: readonly(typingUsers),
    
    // Actions
    setupConversation,
    leaveConversation,
    startTyping,
    stopTyping,
    isUserOnline,
    getTypingUsers,
    cleanup
  }
}
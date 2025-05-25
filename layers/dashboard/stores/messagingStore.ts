import { defineStore } from 'pinia'
import type { Conversation, Message, SendMessagePayload, CreateConversationPayload } from '../types/messaging'

interface MessagingState {
  conversations: Conversation[]
  activeConversation: Conversation | null
  messages: Message[]
  loading: boolean
  sending: boolean
  hasMore: boolean
  error: string | null
}

// Utility function to create mutable copies of messages
const deepCopyMessage = (message: Message): Message => ({
  ...message,
  files: message.files ? message.files.map(file => ({ ...file })) : undefined,
  readBy: message.readBy ? message.readBy.map(receipt => ({ ...receipt })) : undefined
})

// Utility function to create mutable copies of conversations
const deepCopyConversation = (conversation: Conversation): Conversation => ({
  ...conversation,
  lastMessage: conversation.lastMessage ? deepCopyMessage(conversation.lastMessage) : undefined
})

export const useMessagingStore = defineStore('messaging', {
  state: (): MessagingState => ({
    conversations: [],
    activeConversation: null,
    messages: [],
    loading: false,
    sending: false,
    hasMore: false,
    error: null
  }),

  actions: {
    async fetchConversations(projectId?: string) {
      this.loading = true
      this.error = null
      
      try {
        const params = new URLSearchParams()
        if (projectId) params.append('projectId', projectId)
        
        const data = await $fetch<{ conversations: Conversation[], total: number }>(`/api/messaging/conversations?${params}`)
        this.conversations = data.conversations.map(deepCopyConversation)
      } catch (error: any) {
        this.error = error.data?.message || 'Failed to fetch conversations'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchMessages(conversationId: string, before?: string) {
      this.loading = true
      this.error = null
      
      try {
        const params = new URLSearchParams()
        if (before) params.append('before', before)
        
        const data = await $fetch<{ messages: Message[], hasMore: boolean }>(`/api/messaging/conversations/${conversationId}/messages?${params}`)
        
        // Ensure messages are mutable (deep copy for nested arrays)
        const mutableMessages = data.messages.map(deepCopyMessage)
        
        if (before) {
          // Prepend older messages
          this.messages = [...mutableMessages, ...this.messages]
        } else {
          // Replace with new messages
          this.messages = mutableMessages
        }
        
        this.hasMore = data.hasMore
      } catch (error: any) {
        this.error = error.data?.message || 'Failed to fetch messages'
        throw error
      } finally {
        this.loading = false
      }
    },

    async sendMessage(conversationId: string, payload: SendMessagePayload) {
      this.sending = true
      this.error = null
      
      try {
        const data = await $fetch<{ message: Message }>(`/api/messaging/conversations/${conversationId}/messages`, {
          method: 'POST',
          body: payload
        })
        
        // Add message to local state (ensure it's mutable with deep copy)
        this.messages.push(deepCopyMessage(data.message))
        
        // Update conversation's last message
        const conversation = this.conversations.find(c => c.id === conversationId)
        if (conversation) {
          conversation.lastMessage = data.message
          conversation.updatedAt = new Date()
        }
        
        return data.message
      } catch (error: any) {
        this.error = error.data?.message || 'Failed to send message'
        throw error
      } finally {
        this.sending = false
      }
    },

    async createConversation(payload: CreateConversationPayload) {
      this.loading = true
      this.error = null
      
      try {
        const data = await $fetch<{ conversation: Conversation }>('/api/messaging/conversations', {
          method: 'POST',
          body: payload
        })
        
        // Add to local state (ensure it's mutable)
        const mutableConversation = deepCopyConversation(data.conversation)
        this.conversations.unshift(mutableConversation)
        
        return mutableConversation
      } catch (error: any) {
        this.error = error.data?.message || 'Failed to create conversation'
        throw error
      } finally {
        this.loading = false
      }
    },

    async markMessagesAsRead(conversationId: string, messageIds: string[]) {
      try {
        await $fetch(`/api/messaging/conversations/${conversationId}/read`, {
          method: 'POST',
          body: { messageIds }
        })
        
        // Update local state
        const conversation = this.conversations.find(c => c.id === conversationId)
        if (conversation) {
          conversation.unreadCount = 0
        }
      } catch (error) {
        console.error('Failed to mark messages as read:', error)
      }
    },

    setActiveConversation(conversation: Conversation | null) {
      this.activeConversation = conversation
      if (!conversation) {
        this.messages = []
      }
    },

    // Real-time updates via WebSocket
    addMessage(message: Message) {
      // Set isOwn property based on current user
      const currentUser = useUserState().user.value
      const mutableMessage = deepCopyMessage(message)
      if (currentUser) {
        mutableMessage.isOwn = mutableMessage.senderId === currentUser.id
      }

      // Check if message belongs to current conversation
      if (this.activeConversation?.id === mutableMessage.conversationId) {
        // Avoid duplicates
        const existingMessage = this.messages.find(m => m.id === mutableMessage.id)
        if (!existingMessage) {
          this.messages.push(mutableMessage)
        }
      }
      
      // Update conversation's last message
      const conversation = this.conversations.find(c => c.id === mutableMessage.conversationId)
      if (conversation) {
        conversation.lastMessage = mutableMessage
        conversation.updatedAt = new Date(mutableMessage.createdAt)
        if (!mutableMessage.isOwn) {
          conversation.unreadCount = (conversation.unreadCount || 0) + 1
        }
      }
    },

    updateMessageStatus(messageId: string, status: Partial<Message>) {
      const message = this.messages.find(m => m.id === messageId)
      if (message) {
        Object.assign(message, status)
      }
    },

    clearStore() {
      this.conversations = []
      this.activeConversation = null
      this.messages = []
      this.loading = false
      this.sending = false
      this.hasMore = false
      this.error = null
    }
  }
})
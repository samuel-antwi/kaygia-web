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
        this.conversations = data.conversations
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
        
        if (before) {
          // Prepend older messages
          this.messages = [...data.messages, ...this.messages]
        } else {
          // Replace with new messages
          this.messages = data.messages
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
        
        // Add message to local state
        this.messages.push(data.message)
        
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
        
        // Add to local state
        this.conversations.unshift(data.conversation)
        
        return data.conversation
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

    // Real-time updates (to be implemented with WebSocket)
    addMessage(message: Message) {
      // Check if message belongs to current conversation
      if (this.activeConversation?.id === message.conversationId) {
        this.messages.push(message)
      }
      
      // Update conversation's last message
      const conversation = this.conversations.find(c => c.id === message.conversationId)
      if (conversation) {
        conversation.lastMessage = message
        conversation.updatedAt = new Date()
        if (!message.isOwn) {
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
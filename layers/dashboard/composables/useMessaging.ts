import { useMessagingStore } from '../stores/messagingStore'
import type { SendMessagePayload, CreateConversationPayload } from '../types/messaging'
import { useToast } from '~/components/ui/toast/use-toast'

export const useMessaging = () => {
  const store = useMessagingStore()
  const { toast } = useToast()
  
  const toastError = (message: string) => {
    toast({
      title: 'Error',
      description: message,
      variant: 'destructive'
    })
  }
  
  const toastSuccess = (message: string) => {
    toast({
      title: 'Success',
      description: message
    })
  }

  const conversations = computed(() => store.conversations)
  const activeConversation = computed(() => store.activeConversation)
  const messages = computed(() => store.messages)
  const loading = computed(() => store.loading)
  const sending = computed(() => store.sending)
  const hasMore = computed(() => store.hasMore)

  const loadConversations = async (projectId?: string) => {
    try {
      await store.fetchConversations(projectId)
    } catch (error) {
      toastError('Failed to load conversations')
    }
  }

  const loadMessages = async (conversationId: string, before?: string) => {
    try {
      await store.fetchMessages(conversationId, before)
    } catch (error) {
      toastError('Failed to load messages')
    }
  }

  const sendMessage = async (conversationId: string, content: string, options: Partial<SendMessagePayload> = {}) => {
    if (!content.trim()) return

    try {
      const payload: SendMessagePayload = {
        content: content.trim(),
        ...options
      }
      
      const message = await store.sendMessage(conversationId, payload)
      return message
    } catch (error) {
      toastError('Failed to send message')
      throw error
    }
  }

  const createConversation = async (payload: CreateConversationPayload) => {
    try {
      const conversation = await store.createConversation(payload)
      toastSuccess('Conversation created')
      return conversation
    } catch (error) {
      toastError('Failed to create conversation')
      throw error
    }
  }

  const selectConversation = async (conversationId: string) => {
    const conversation = conversations.value.find(c => c.id === conversationId)
    if (!conversation) return

    store.setActiveConversation(conversation)
    await loadMessages(conversationId)
    
    // Mark messages as read
    const userState = useUserState()
    const userId = userState.user.value?.id
    if (!userId) return
    
    const unreadMessageIds = messages.value
      .filter(m => !m.isOwn && !m.readBy?.some(r => r.userId === userId))
      .map(m => m.id)
    
    if (unreadMessageIds.length > 0) {
      await store.markMessagesAsRead(conversationId, unreadMessageIds)
    }
  }

  const loadMoreMessages = async () => {
    if (!activeConversation.value || !hasMore.value || loading.value) return

    const oldestMessage = messages.value[0]
    if (oldestMessage) {
      await loadMessages(activeConversation.value.id, oldestMessage.createdAt.toISOString())
    }
  }

  // Format timestamp for display
  const formatMessageTime = (date: Date | string) => {
    const messageDate = new Date(date)
    const now = new Date()
    const diffMs = now.getTime() - messageDate.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    
    return messageDate.toLocaleDateString('en-UK', {
      day: 'numeric',
      month: 'short',
      year: messageDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }

  // Group messages by date
  const groupedMessages = computed(() => {
    const groups: Record<string, typeof messages.value> = {}
    
    messages.value.forEach(message => {
      const date = new Date(message.createdAt).toDateString()
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(message)
    })
    
    return Object.entries(groups).map(([date, msgs]) => ({
      date,
      messages: msgs
    }))
  })

  // Get unread count for a conversation
  const getUnreadCount = (conversationId: string) => {
    const conversation = conversations.value.find(c => c.id === conversationId)
    return conversation?.unreadCount || 0
  }

  // Get total unread count
  const totalUnreadCount = computed(() => {
    return conversations.value.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0)
  })

  onUnmounted(() => {
    store.clearStore()
  })

  return {
    // State
    conversations: readonly(conversations),
    activeConversation: readonly(activeConversation),
    messages: readonly(messages),
    loading: readonly(loading),
    sending: readonly(sending),
    hasMore: readonly(hasMore),
    groupedMessages: readonly(groupedMessages),
    totalUnreadCount: readonly(totalUnreadCount),
    
    // Actions
    loadConversations,
    loadMessages,
    sendMessage,
    createConversation,
    selectConversation,
    loadMoreMessages,
    
    // Utilities
    formatMessageTime,
    getUnreadCount
  }
}
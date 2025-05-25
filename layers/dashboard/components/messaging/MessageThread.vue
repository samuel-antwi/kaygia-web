<template>
  <div class="flex flex-col h-full">
    <!-- Header -->
    <div v-if="activeConversation" class="p-4 border-b bg-background/95 backdrop-blur">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <!-- Back button for mobile -->
          <Button
            variant="ghost"
            size="sm"
            class="lg:hidden"
            @click="$emit('back')"
          >
            <ArrowLeft class="w-4 h-4" />
          </Button>
          
          <Avatar class="w-8 h-8">
            <AvatarFallback>
              {{ getProjectInitials(activeConversation.project?.name || 'Project') }}
            </AvatarFallback>
          </Avatar>
          
          <div>
            <h3 class="font-semibold">
              {{ activeConversation.title || activeConversation.project?.name }}
            </h3>
            <p class="text-sm text-muted-foreground">
              {{ activeConversation.project?.name ? `Project: ${activeConversation.project.name}` : '' }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <!-- Status badge -->
          <Badge
            :variant="activeConversation.status === 'active' ? 'default' : 'secondary'"
          >
            {{ activeConversation.status }}
          </Badge>
          
          <!-- More options -->
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical class="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem @click="loadMoreMessages">
                <History class="w-4 h-4 mr-2" />
                Load older messages
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Archive class="w-4 h-4 mr-2" />
                Archive conversation
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <MessageSquare class="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
        <h3 class="text-lg font-semibold mb-2">Select a conversation</h3>
        <p class="text-muted-foreground">Choose a conversation from the list to start messaging</p>
      </div>
    </div>

    <!-- Messages -->
    <div
      v-if="activeConversation"
      ref="messagesContainer"
      class="flex-1 overflow-y-auto p-4 space-y-4"
      @scroll="handleScroll"
    >
      <!-- Load more button -->
      <div v-if="hasMore && !loading" class="text-center">
        <Button variant="ghost" size="sm" @click="loadMoreMessages">
          <ChevronUp class="w-4 h-4 mr-2" />
          Load older messages
        </Button>
      </div>

      <!-- Loading indicator -->
      <div v-if="loading" class="text-center py-4">
        <div class="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
      </div>

      <!-- Message groups by date -->
      <div v-for="group in groupedMessages" :key="group.date" class="space-y-4">
        <!-- Date separator -->
        <div class="flex items-center justify-center">
          <div class="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">
            {{ formatDate(group.date) }}
          </div>
        </div>

        <!-- Messages for this date -->
        <div class="space-y-3">
          <MessageBubble
            v-for="message in group.messages"
            :key="message.id"
            :message="(message as any)"
            :is-own="message.isOwn || false"
            @retry="retryMessage"
          />
        </div>
      </div>

      <!-- Typing indicators -->
      <div v-if="typingUsers.size > 0" class="flex items-center gap-2 text-sm text-muted-foreground">
        <div class="flex space-x-1">
          <div class="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style="animation-delay: 0s" />
          <div class="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style="animation-delay: 0.1s" />
          <div class="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style="animation-delay: 0.2s" />
        </div>
        <span>
          {{ Array.from(typingUsers).join(', ') }} 
          {{ typingUsers.size === 1 ? 'is' : 'are' }} typing...
        </span>
      </div>

      <!-- Scroll to bottom target -->
      <div ref="bottomElement" />
    </div>

    <!-- Message Input -->
    <MessageInput
      v-if="activeConversation"
      :conversation-id="activeConversation.id"
      :disabled="activeConversation.status !== 'active'"
      @send="handleSendMessage"
      @typing="handleTyping"
      @stop-typing="handleStopTyping"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'
import { 
  ArrowLeft, 
  MessageSquare, 
  MoreVertical, 
  History, 
  Archive, 
  ChevronUp 
} from 'lucide-vue-next'
import { useMessaging } from '../../composables/useMessaging'
import MessageBubble from './MessageBubble.vue'
import MessageInput from './MessageInput.vue'
import type { Message } from '../../types/messaging'

defineEmits<{
  back: []
}>()

const {
  activeConversation,
  messages,
  groupedMessages,
  loading,
  hasMore,
  typingUsers,
  loadMoreMessages: loadMore,
  sendMessage,
  handleTyping: onTyping,
  handleStopTyping: onStopTyping
} = useMessaging()

const messagesContainer = ref<HTMLElement>()
const bottomElement = ref<HTMLElement>()

// Helper functions
const getProjectInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) {
    return 'Today'
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday'
  } else {
    return date.toLocaleDateString('en-UK', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
}

// Message handling
const handleSendMessage = async (content: string) => {
  if (!activeConversation.value) return

  try {
    await sendMessage(activeConversation.value.id, content)
    // Scroll to bottom after sending
    await nextTick()
    scrollToBottom()
  } catch (error) {
    console.error('Failed to send message:', error)
  }
}

const loadMoreMessages = async () => {
  if (!hasMore.value || loading.value) return
  
  const container = messagesContainer.value
  const scrollHeight = container?.scrollHeight || 0
  
  await loadMore()
  
  // Maintain scroll position after loading more messages
  await nextTick()
  if (container) {
    const newScrollHeight = container.scrollHeight
    container.scrollTop = newScrollHeight - scrollHeight
  }
}

const retryMessage = async (message: Message) => {
  // TODO: Implement message retry logic
  console.log('Retry message:', message.id)
}

// Typing indicators
const handleTyping = () => {
  if (activeConversation.value) {
    onTyping(activeConversation.value.id)
  }
}

const handleStopTyping = () => {
  if (activeConversation.value) {
    onStopTyping(activeConversation.value.id)
  }
}

// Scroll management
const scrollToBottom = (smooth = true) => {
  bottomElement.value?.scrollIntoView({ 
    behavior: smooth ? 'smooth' : 'auto' 
  })
}

const handleScroll = () => {
  const container = messagesContainer.value
  if (!container) return

  // Auto-load more messages when scrolling near the top
  if (container.scrollTop < 100 && hasMore.value && !loading.value) {
    loadMoreMessages()
  }
}

// Auto-scroll to bottom when new messages arrive
watch(
  () => messages.value.length,
  async (newLength, oldLength) => {
    if (newLength > oldLength) {
      await nextTick()
      
      // Only auto-scroll if user is near the bottom
      const container = messagesContainer.value
      if (container) {
        const isNearBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 100
        if (isNearBottom) {
          scrollToBottom()
        }
      }
    }
  }
)

// Scroll to bottom when conversation changes
watch(
  () => activeConversation.value?.id,
  async () => {
    await nextTick()
    scrollToBottom(false) // Immediate scroll, no animation
  }
)
</script>
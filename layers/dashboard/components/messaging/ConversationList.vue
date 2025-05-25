<template>
  <div class="flex flex-col h-full">
    <!-- Header -->
    <div class="p-4 border-b">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold">Messages</h2>
        <div class="flex items-center gap-2">
          <div class="flex items-center gap-2">
            <div
              :class="[
                'w-2 h-2 rounded-full',
                isConnected ? 'bg-green-500' : 'bg-red-500'
              ]"
            />
            <span class="text-xs text-muted-foreground">
              {{ isConnected ? 'Connected' : 'Disconnected' }}
            </span>
          </div>
          <Button variant="ghost" size="sm" @click="refreshConversations">
            <RotateCcw class="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <!-- Search -->
      <div class="mt-3">
        <div class="relative">
          <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            v-model="searchQuery"
            placeholder="Search conversations..."
            class="pl-9"
          />
        </div>
      </div>
    </div>

    <!-- Conversation List -->
    <div class="flex-1 overflow-y-auto">
      <div v-if="loading" class="p-4">
        <div class="space-y-3">
          <div v-for="i in 3" :key="i" class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-muted rounded-full animate-pulse" />
            <div class="flex-1 space-y-2">
              <div class="h-4 bg-muted rounded animate-pulse" />
              <div class="h-3 bg-muted rounded w-3/4 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="filteredConversations.length === 0" class="p-4 text-center text-muted-foreground">
        <MessageSquare class="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>No conversations found</p>
        <p class="text-sm">Start a new conversation from a project</p>
      </div>

      <div v-else class="space-y-1">
        <div
          v-for="conversation in filteredConversations"
          :key="conversation.id"
          :class="[
            'flex items-center p-3 mx-2 rounded-lg cursor-pointer transition-colors',
            activeConversation?.id === conversation.id
              ? 'bg-primary/10 border border-primary/20'
              : 'hover:bg-muted/50'
          ]"
          @click="selectConversation(conversation.id)"
        >
          <!-- Project Avatar -->
          <div class="relative">
            <Avatar class="w-10 h-10">
              <AvatarFallback>
                {{ getProjectInitials(conversation.project?.name || 'Project') }}
              </AvatarFallback>
            </Avatar>
            
            <!-- Unread badge -->
            <div
              v-if="conversation.unreadCount && conversation.unreadCount > 0"
              class="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center"
            >
              {{ conversation.unreadCount > 99 ? '99+' : conversation.unreadCount }}
            </div>
          </div>

          <!-- Conversation Info -->
          <div class="flex-1 ml-3 min-w-0">
            <div class="flex items-center justify-between mb-1">
              <h3 class="font-medium truncate">
                {{ conversation.title || conversation.project?.name }}
              </h3>
              <span class="text-xs text-muted-foreground">
                {{ formatTime(conversation.lastMessage?.createdAt || conversation.updatedAt) }}
              </span>
            </div>
            
            <div class="flex items-center justify-between">
              <p class="text-sm text-muted-foreground truncate">
                <span v-if="conversation.lastMessage">
                  <span v-if="conversation.lastMessage.sender?.name" class="font-medium">
                    {{ conversation.lastMessage.isOwn ? 'You' : conversation.lastMessage.sender.name }}:
                  </span>
                  {{ conversation.lastMessage.content || '[File]' }}
                </span>
                <span v-else class="italic">No messages yet</span>
              </p>
              
              <!-- Status indicators -->
              <div class="flex items-center gap-1">
                <Badge
                  v-if="conversation.status !== 'active'"
                  variant="secondary"
                  class="text-xs"
                >
                  {{ conversation.status }}
                </Badge>
                <div
                  v-if="conversation.type !== 'project'"
                  :class="[
                    'w-2 h-2 rounded-full',
                    conversation.type === 'support' ? 'bg-yellow-500' : 'bg-blue-500'
                  ]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer with total unread count -->
    <div v-if="totalUnreadCount > 0" class="p-3 border-t bg-muted/30">
      <div class="text-center text-sm text-muted-foreground">
        {{ totalUnreadCount }} unread message{{ totalUnreadCount !== 1 ? 's' : '' }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Search, MessageSquare, RotateCcw } from 'lucide-vue-next'
import { useMessaging } from '../../composables/useMessaging'

const {
  conversations,
  activeConversation,
  loading,
  totalUnreadCount,
  isConnected,
  loadConversations,
  selectConversation,
  formatMessageTime
} = useMessaging()

const searchQuery = ref('')

// Filter conversations based on search
const filteredConversations = computed(() => {
  if (!searchQuery.value) return conversations.value

  const query = searchQuery.value.toLowerCase()
  return conversations.value.filter(conv => 
    conv.title?.toLowerCase().includes(query) ||
    conv.project?.name?.toLowerCase().includes(query) ||
    conv.lastMessage?.content?.toLowerCase().includes(query)
  )
})

// Helper functions
const getProjectInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const formatTime = (date: Date | string) => {
  if (!date) return ''
  return formatMessageTime(date)
}

const refreshConversations = async () => {
  await loadConversations()
}

// Load conversations on mount
onMounted(() => {
  loadConversations()
})
</script>
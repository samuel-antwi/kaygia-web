<template>
  <div class="h-full bg-background">
    <!-- Desktop layout -->
    <div class="hidden lg:flex h-full">
      <!-- Conversation list -->
      <div class="w-80 border-r flex-shrink-0">
        <ConversationList />
      </div>
      
      <!-- Message thread -->
      <div class="flex-1 min-w-0">
        <MessageThread />
      </div>
    </div>

    <!-- Mobile layout -->
    <div class="lg:hidden h-full">
      <!-- Show conversation list when no active conversation -->
      <div v-show="!activeConversation" class="h-full">
        <ConversationList />
      </div>
      
      <!-- Show message thread when conversation is active -->
      <div v-show="activeConversation" class="h-full">
        <MessageThread @back="handleBack" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMessaging } from '../../composables/useMessaging'
import ConversationList from './ConversationList.vue'
import MessageThread from './MessageThread.vue'

const { activeConversation, setActiveConversation } = useMessaging()

const handleBack = () => {
  setActiveConversation(null)
}
</script>
<template>
  <div class="flex h-full bg-background">
    <!-- Desktop: Side-by-side layout -->
    <div class="hidden lg:flex w-full">
      <!-- Conversation list -->
      <div class="w-80 border-r">
        <ConversationList />
      </div>
      
      <!-- Message thread -->
      <div class="flex-1">
        <MessageThread />
      </div>
    </div>

    <!-- Mobile: Stack layout with navigation -->
    <div class="lg:hidden w-full">
      <!-- Conversation list view -->
      <div v-if="!activeConversation" class="h-full">
        <ConversationList />
      </div>
      
      <!-- Message thread view -->
      <div v-else class="h-full">
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
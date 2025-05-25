<template>
  <div>
    <!-- Page Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold mb-2">Messages</h1>
      <p class="text-muted-foreground">
        Communicate with your team about project progress and updates
      </p>
    </div>

    <!-- Messaging Interface -->
    <Card class="h-[calc(100vh-12rem)]">
      <MessagingLayout />
    </Card>
  </div>
</template>

<script setup lang="ts">
import MessagingLayout from '../../components/messaging/MessagingLayout.vue'

// Set page metadata
definePageMeta({
  title: 'Messages',
  layout: 'dashboard'
})

// Use the messaging composable to initialize WebSocket connection
const { connect } = useSocket()

// Initialize WebSocket connection when page loads
onMounted(async () => {
  await connect()
})
</script>
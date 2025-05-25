<script setup lang="ts">
import { onMounted, watch } from "vue";
import MessagingLayout from "../../components/messaging/MessagingLayout.vue";
import { useMessaging } from "../../composables/useMessaging";

// Set page metadata
definePageMeta({
  title: "Messages",
  layout: "dashboard",
});

const route = useRoute();
const { selectConversation, conversations } = useMessaging();

// Handle conversation query parameter
const handleConversationQuery = () => {
  const conversationId = route.query.conversation as string;
  if (conversationId) {
    // Wait for conversations to load then select the specified one
    const checkAndSelect = () => {
      const conversation = conversations.value.find(
        (c) => c.id === conversationId
      );
      if (conversation) {
        selectConversation(conversationId);
      }
    };

    // Try immediately if conversations are already loaded
    if (conversations.value.length > 0) {
      checkAndSelect();
    } else {
      // Watch for conversations to be loaded
      const unwatch = watch(conversations, () => {
        if (conversations.value.length > 0) {
          checkAndSelect();
          unwatch(); // Stop watching after selecting
        }
      });
    }
  }
};

onMounted(() => {
  handleConversationQuery();
});

// Also watch for route changes
watch(
  () => route.query.conversation,
  () => {
    handleConversationQuery();
  }
);
</script>

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

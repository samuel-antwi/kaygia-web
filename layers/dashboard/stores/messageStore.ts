import { defineStore } from "pinia";
import type { ContactMessage } from "../types/message";

export const useMessageStore = defineStore("message", () => {
  // State
  const messages = ref<ContactMessage[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Actions
  async function fetchMessages() {
    isLoading.value = true;
    error.value = null;

    try {
      const { data } = await useFetch("/api/messages");
      const response = data.value as any;

      if (response?.success && response?.messages) {
        messages.value = response.messages;
      } else {
        error.value = response?.error || "Failed to fetch messages";
      }
    } catch (err: any) {
      error.value = err.message || "An unexpected error occurred";
      console.error("Error fetching messages:", err);
    } finally {
      isLoading.value = false;
    }
  }

  async function markAsRead(messageId: string) {
    try {
      const { data } = await useFetch(`/api/messages/${messageId}/read`, {
        method: "POST",
      });

      const response = data.value as any;

      if (response?.success) {
        // Update the message in the store
        const messageIndex = messages.value.findIndex(
          (m) => m.id === messageId
        );
        if (messageIndex !== -1) {
          messages.value[messageIndex].isRead = true;
        }
        return true;
      } else {
        error.value = response?.error || "Failed to mark message as read";
        return false;
      }
    } catch (err: any) {
      error.value = err.message || "An unexpected error occurred";
      console.error("Error marking message as read:", err);
      return false;
    }
  }

  // Getters
  const unreadCount = computed(() => {
    return messages.value.filter((message) => !message.isRead).length;
  });

  const sortedMessages = computed(() => {
    return [...messages.value].sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  });

  return {
    messages,
    isLoading,
    error,
    fetchMessages,
    markAsRead,
    unreadCount,
    sortedMessages,
  };
});

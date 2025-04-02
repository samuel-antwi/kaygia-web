import { defineStore } from "pinia";
import type { ClientMessage } from "../types/message";

export const useMessageStore = defineStore("message", () => {
  // State
  const messages = ref<ClientMessage[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const isSending = ref(false);

  // Actions
  async function fetchMessages() {
    isLoading.value = true;
    error.value = null;

    try {
      const { data: responseData, error: fetchError } = await useFetch(
        "/api/messages",
        {
          headers: {
            "Cache-Control": "no-cache",
          },
        }
      );

      if (fetchError.value) {
        error.value = fetchError.value.message || "Failed to fetch messages";
        console.error("Error fetching messages:", fetchError.value);
        return;
      }

      const response = responseData.value as any;

      if (response?.success && response?.messages) {
        messages.value = response.messages;
      } else {
        error.value = response?.error || "Failed to fetch messages";
        console.error("Error in response:", response);
      }
    } catch (err: any) {
      error.value = err.message || "An unexpected error occurred";
      console.error("Exception fetching messages:", err);
    } finally {
      isLoading.value = false;
    }
  }

  async function markAsRead(messageId: string) {
    try {
      const { data: responseData, error: fetchError } = await useFetch(
        `/api/messages/${messageId}/read`,
        {
          method: "POST",
          headers: {
            "Cache-Control": "no-cache",
          },
        }
      );

      if (fetchError.value) {
        error.value =
          fetchError.value.message || "Failed to mark message as read";
        return false;
      }

      const response = responseData.value as any;

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

  async function sendMessage(subject: string, content: string) {
    isSending.value = true;
    error.value = null;

    try {
      const { data: responseData, error: fetchError } = await useFetch(
        "/api/messages",
        {
          method: "POST",
          body: { subject, content },
          headers: {
            "Cache-Control": "no-cache",
            "Content-Type": "application/json",
          },
        }
      );

      if (fetchError.value) {
        error.value = fetchError.value.message || "Failed to send message";
        return false;
      }

      const response = responseData.value as any;

      if (response?.success && response?.message) {
        // Add the new message to the store
        messages.value = [response.message, ...messages.value];
        return true;
      } else {
        error.value = response?.error || "Failed to send message";
        return false;
      }
    } catch (err: any) {
      error.value = err.message || "An unexpected error occurred";
      console.error("Error sending message:", err);
      return false;
    } finally {
      isSending.value = false;
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

  const adminMessages = computed(() => {
    return sortedMessages.value.filter((message) => message.sender === "ADMIN");
  });

  const clientMessages = computed(() => {
    return sortedMessages.value.filter(
      (message) => message.sender === "CLIENT"
    );
  });

  return {
    messages,
    isLoading,
    isSending,
    error,
    fetchMessages,
    markAsRead,
    sendMessage,
    unreadCount,
    sortedMessages,
    adminMessages,
    clientMessages,
  };
});

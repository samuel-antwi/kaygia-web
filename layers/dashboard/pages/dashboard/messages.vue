<script setup lang="ts">
import {
  MessageSquare,
  Check,
  Clock,
  Eye,
  Search,
  Mail,
  MailOpen,
  Calendar,
} from "lucide-vue-next";
import { useMessageStore } from "../../stores/messageStore";
import type { ContactMessage } from "../../types/message";

definePageMeta({
  layout: "dashboard",
  middleware: "auth",
});

// Initialize message store
const messageStore = useMessageStore();
const { sortedMessages, isLoading, error } = storeToRefs(messageStore);

// State
const searchQuery = ref("");
const selectedMessage = ref<ContactMessage | null>(null);
const showDetails = ref(false);

// Load messages on mount
onMounted(async () => {
  await messageStore.fetchMessages();
});

// Format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

// Format time
const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Filter messages by search query
const filteredMessages = computed(() => {
  if (!searchQuery.value) return sortedMessages.value;

  const query = searchQuery.value.toLowerCase();
  return sortedMessages.value.filter((message) => {
    return (
      message.name.toLowerCase().includes(query) ||
      message.email.toLowerCase().includes(query) ||
      message.message.toLowerCase().includes(query) ||
      (message.company && message.company.toLowerCase().includes(query))
    );
  });
});

// View message details
const viewMessage = async (message: ContactMessage) => {
  selectedMessage.value = message;
  showDetails.value = true;

  // Mark as read if not already
  if (!message.isRead) {
    await messageStore.markAsRead(message.id);
  }
};

// Close message details
const closeDetails = () => {
  showDetails.value = false;
  selectedMessage.value = null;
};
</script>

<template>
  <div>
    <div class="mb-6">
      <h2 class="text-2xl sm:text-3xl font-bold mb-2">Messages</h2>
      <p class="text-muted-foreground">
        View and manage your messages and inquiries.
      </p>
    </div>

    <!-- Main content -->
    <Card class="overflow-hidden">
      <CardHeader>
        <div
          class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <CardTitle>Your Messages</CardTitle>
            <CardDescription>
              View messages and inquiries from our team.
            </CardDescription>
          </div>
          <div class="relative w-full sm:w-64">
            <Input
              v-model="searchQuery"
              type="text"
              placeholder="Search messages..."
              class="pr-8"
            />
            <Search
              class="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent class="p-0">
        <div v-if="isLoading" class="flex justify-center py-12">
          <div
            class="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"
          ></div>
          <span class="sr-only">Loading...</span>
        </div>

        <div v-else-if="error" class="p-6 text-center">
          <AlertCircle class="mx-auto h-10 w-10 text-destructive mb-2" />
          <p class="text-destructive font-medium mb-1">
            Error Loading Messages
          </p>
          <p class="text-muted-foreground">{{ error }}</p>
        </div>

        <div
          v-else-if="sortedMessages.length === 0"
          class="flex flex-col items-center justify-center py-12 px-4 text-center"
        >
          <MessageSquare class="h-12 w-12 text-muted-foreground mb-3" />
          <h3 class="text-lg font-medium mb-1">No Messages Yet</h3>
          <p class="text-muted-foreground max-w-md">
            You don't have any messages yet. Check back later or reach out to us
            if you need assistance.
          </p>
        </div>

        <div v-else class="divide-y">
          <div
            v-for="message in filteredMessages"
            :key="message.id"
            @click="viewMessage(message)"
            class="p-4 sm:p-6 hover:bg-accent/50 cursor-pointer transition-colors"
            :class="{
              'bg-primary/5': !message.isRead,
            }"
          >
            <div class="flex items-start gap-4">
              <div
                class="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0"
              >
                <component
                  :is="message.isRead ? MailOpen : Mail"
                  class="h-5 w-5 text-primary"
                />
              </div>
              <div class="flex-1 min-w-0">
                <div
                  class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2"
                >
                  <div>
                    <h4 class="font-medium truncate">
                      {{ message.name }}
                      <span
                        v-if="message.company"
                        class="text-muted-foreground"
                      >
                        • {{ message.company }}
                      </span>
                    </h4>
                    <p class="text-sm text-muted-foreground truncate">
                      {{ message.email }}
                    </p>
                  </div>
                  <div
                    class="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <span class="flex items-center">
                      <Calendar class="h-3.5 w-3.5 mr-1" />
                      {{ formatDate(message.createdAt) }}
                    </span>
                    <span class="flex items-center">
                      <Clock class="h-3.5 w-3.5 mr-1" />
                      {{ formatTime(message.createdAt) }}
                    </span>
                  </div>
                </div>
                <p class="text-sm line-clamp-2">
                  {{ message.message }}
                </p>
              </div>
              <div
                v-if="!message.isRead"
                class="h-2.5 w-2.5 rounded-full bg-primary flex-shrink-0"
              ></div>
            </div>
          </div>
        </div>

        <!-- Empty search results -->
        <div
          v-if="
            searchQuery &&
            filteredMessages.length === 0 &&
            sortedMessages.length > 0
          "
          class="p-6 text-center"
        >
          <Search class="mx-auto h-10 w-10 text-muted-foreground mb-2" />
          <p class="text-muted-foreground">
            No messages found matching "{{ searchQuery }}".
          </p>
        </div>
      </CardContent>
    </Card>

    <!-- Message detail dialog -->
    <Dialog v-model:open="showDetails">
      <DialogContent class="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Message from {{ selectedMessage?.name }}</DialogTitle>
          <DialogDescription>
            {{ formatDate(selectedMessage?.createdAt || "") }} at
            {{ formatTime(selectedMessage?.createdAt || "") }}
          </DialogDescription>
        </DialogHeader>

        <div v-if="selectedMessage" class="space-y-4">
          <div>
            <p class="text-sm font-medium text-muted-foreground mb-1">From:</p>
            <p>{{ selectedMessage.name }}</p>
          </div>

          <div v-if="selectedMessage.company">
            <p class="text-sm font-medium text-muted-foreground mb-1">
              Company:
            </p>
            <p>{{ selectedMessage.company }}</p>
          </div>

          <div>
            <p class="text-sm font-medium text-muted-foreground mb-1">Email:</p>
            <p>{{ selectedMessage.email }}</p>
          </div>

          <div>
            <p class="text-sm font-medium text-muted-foreground mb-1">
              Message:
            </p>
            <p class="whitespace-pre-line">{{ selectedMessage.message }}</p>
          </div>
        </div>

        <DialogFooter>
          <Button @click="closeDetails">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

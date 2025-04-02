<script setup lang="ts">
import {
  MessageSquare,
  Send,
  Clock,
  Eye,
  Search,
  Mail,
  MailOpen,
  Calendar,
  AlertCircle,
  UserCircle,
  MessagesSquare,
  MessageCircle,
  Plus,
} from "lucide-vue-next";
import { useMessageStore } from "../../stores/messageStore";
import type { ClientMessage } from "../../types/message";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import DialogContentFixed from "../../../../components/ui/dialog/DialogContentFixed.vue";
import { useAuth } from "../../../auth/composables/useAuth";

definePageMeta({
  layout: "dashboard",
  middleware: "auth",
});

// Initialize message store
const messageStore = useMessageStore();
messageStore.error = null;
const { sortedMessages, isLoading, error, isSending } =
  storeToRefs(messageStore);

// Auth state
const { user, loading: authLoading } = useAuth();

// State
const searchQuery = ref("");
const selectedMessage = ref<ClientMessage | null>(null);
const showDetails = ref(false);
const showNewMessage = ref(false);

// Watch for auth state before fetching messages
watchEffect(() => {
  if (!authLoading.value && user.value) {
    messageStore.fetchMessages();
  }
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
      message.subject.toLowerCase().includes(query) ||
      message.content.toLowerCase().includes(query)
    );
  });
});

// View message details
const viewMessage = async (message: ClientMessage) => {
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

// New message form schema
const formSchema = toTypedSchema(
  z.object({
    subject: z.string().min(3, "Subject must be at least 3 characters"),
    content: z.string().min(10, "Message must be at least 10 characters"),
  })
);

// Form validation
const { handleSubmit, resetForm } = useForm({
  validationSchema: formSchema,
});

// Handle form submission
const onSubmit = handleSubmit(async (values) => {
  const success = await messageStore.sendMessage(
    values.subject,
    values.content
  );

  if (success) {
    showNewMessage.value = false;
    resetForm();
  }
});

// Helper functions for the UI
const getSenderIcon = (sender: string) => {
  return sender === "ADMIN" ? MessagesSquare : UserCircle;
};

const getSenderName = (sender: string) => {
  return sender === "ADMIN" ? "Admin" : "You";
};
</script>

<template>
  <ClientOnly>
    <div class="mb-6">
      <div
        class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
      >
        <h2 class="text-2xl sm:text-3xl font-bold">Messages</h2>
        <Button @click="showNewMessage = true" class="flex items-center gap-2">
          <Plus class="w-4 h-4" />
          <span>New Message</span>
        </Button>
      </div>
      <p class="text-muted-foreground mt-2">
        Send and receive messages with our support team.
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
              View messages and inquiries with our team.
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
        <!-- Show loading if either auth or message fetch is loading -->
        <div v-if="authLoading || isLoading" class="flex justify-center py-12">
          <div
            class="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"
          ></div>
          <span class="sr-only">Loading...</span>
        </div>

        <!-- Only show content when auth and message fetch are not loading -->
        <div v-else>
          <!-- Error display -->
          <div v-if="error" class="p-6 text-center">
            <AlertCircle class="mx-auto h-10 w-10 text-destructive mb-2" />
            <p class="text-destructive font-medium mb-1">
              Error Loading Messages
            </p>
            <p class="text-muted-foreground">{{ error }}</p>
          </div>

          <!-- No messages display -->
          <div
            v-else-if="sortedMessages.length === 0"
            class="flex flex-col items-center justify-center py-12 px-4 text-center"
          >
            <MessageSquare class="h-12 w-12 text-muted-foreground mb-3" />
            <h3 class="text-lg font-medium mb-1">No Messages Yet</h3>
            <p class="text-muted-foreground max-w-md">
              You don't have any messages yet. Start a conversation with our
              team by clicking the "New Message" button.
            </p>
            <Button
              @click="showNewMessage = true"
              variant="outline"
              class="mt-4"
            >
              New Message
            </Button>
          </div>

          <!-- Message list display -->
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
              <!-- Message item content -->
              <div class="flex items-start gap-4">
                <!-- Sender Icon -->
                <div
                  class="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0"
                  :class="{ 'bg-secondary/20': message.sender === 'CLIENT' }"
                >
                  <component
                    :is="getSenderIcon(message.sender)"
                    class="h-5 w-5"
                    :class="
                      message.sender === 'ADMIN'
                        ? 'text-primary'
                        : 'text-secondary'
                    "
                  />
                </div>
                <!-- Message Details -->
                <div class="flex-1 min-w-0">
                  <div
                    class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2"
                  >
                    <div>
                      <div class="flex items-center gap-2">
                        <h4 class="font-medium">
                          {{ message.subject }}
                        </h4>
                        <Badge variant="outline" class="text-xs">
                          {{ getSenderName(message.sender) }}
                        </Badge>
                      </div>
                      <p class="text-sm text-muted-foreground truncate">
                        {{ message.content.substring(0, 60)
                        }}{{ message.content.length > 60 ? "..." : "" }}
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
                </div>
                <!-- Unread Indicator -->
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
        </div>
      </CardContent>
    </Card>

    <!-- Message detail dialog -->
    <Dialog v-model:open="showDetails">
      <DialogContentFixed class="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{{ selectedMessage?.subject }}</DialogTitle>
          <DialogDescription>
            {{ formatDate(selectedMessage?.createdAt || "") }} at
            {{ formatTime(selectedMessage?.createdAt || "") }}
          </DialogDescription>
        </DialogHeader>

        <div v-if="selectedMessage" class="space-y-4">
          <div>
            <p class="text-sm font-medium text-muted-foreground mb-1">From:</p>
            <p class="flex items-center gap-2">
              <component
                :is="getSenderIcon(selectedMessage.sender)"
                class="h-4 w-4"
                :class="
                  selectedMessage.sender === 'ADMIN'
                    ? 'text-primary'
                    : 'text-secondary'
                "
              />
              <span>{{ getSenderName(selectedMessage.sender) }}</span>
            </p>
          </div>

          <div>
            <p class="text-sm font-medium text-muted-foreground mb-1">
              Message:
            </p>
            <p class="whitespace-pre-line">{{ selectedMessage.content }}</p>
          </div>
        </div>

        <DialogFooter>
          <Button @click="closeDetails">Close</Button>
        </DialogFooter>
      </DialogContentFixed>
    </Dialog>

    <!-- New message dialog -->
    <Dialog v-model:open="showNewMessage">
      <DialogContentFixed class="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New Message</DialogTitle>
          <DialogDescription>
            Send a message to our support team.
          </DialogDescription>
        </DialogHeader>

        <form @submit="onSubmit" class="space-y-4">
          <FormField v-slot="{ componentField }" name="subject">
            <FormItem>
              <FormLabel>Subject</FormLabel>
              <FormControl>
                <Input
                  class="h-14"
                  type="text"
                  placeholder="Enter subject"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="content">
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Type your message here..."
                  rows="6"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <DialogFooter class="mt-6">
            <Button
              type="button"
              variant="outline"
              @click="showNewMessage = false"
              :disabled="isSending"
            >
              Cancel
            </Button>
            <Button type="submit" :disabled="isSending" class="gap-2">
              <div
                v-if="isSending"
                class="animate-spin h-4 w-4 border-2 border-background border-t-transparent rounded-full"
              ></div>
              <Send v-else class="h-4 w-4" />
              <span>Send Message</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContentFixed>
    </Dialog>
  </ClientOnly>
</template>

<script setup lang="ts">
import { ref, onMounted, watchEffect, nextTick } from "vue";
import { storeToRefs } from "pinia";
import { useRoute, useRouter } from "vue-router";
import { useTicketStore } from "../../../stores/ticketStore";
import { useTicketUtils } from "../../../composables/useTicketUtils";
import { useAuth } from "../../../../auth/composables/useAuth";
import { AlertCircle, Send, ArrowLeft } from "lucide-vue-next";
import { z } from "zod";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";

definePageMeta({
  layout: "dashboard",
  middleware: "auth",
});

const route = useRoute();
const router = useRouter();
const ticketStore = useTicketStore();
const { user } = useAuth(); // Get user to compare comment sender ID
const {
  formatDate,
  formatTime,
  getSenderIcon,
  getSenderName,
  getStatusBadgeVariant,
} = useTicketUtils();

const { currentTicket, isLoadingDetails, isAddingComment, error } =
  storeToRefs(ticketStore);

const ticketId = ref(route.params.id as string);
const commentListRef = ref<HTMLElement | null>(null); // For auto-scrolling

// Fetch ticket details when component mounts or ticketId changes
onMounted(() => {
  if (ticketId.value) {
    ticketStore.fetchTicketDetails(ticketId.value);
  }
});

// Watch for route changes if navigating between ticket details directly
watch(
  () => route.params.id,
  (newId) => {
    if (newId && typeof newId === "string") {
      ticketId.value = newId;
      ticketStore.fetchTicketDetails(newId);
    }
  }
);

// Scroll to bottom when comments load or new one is added
watch(
  () => currentTicket.value?.comments,
  async () => {
    await nextTick(); // Wait for DOM update
    scrollToBottom();
  },
  { deep: true } // Watch for changes within the comments array
);

const scrollToBottom = () => {
  const el = commentListRef.value;
  if (el) {
    el.scrollTop = el.scrollHeight;
  }
};

// Comment form validation
const commentSchema = toTypedSchema(
  z.object({
    content: z.string().min(1, "Comment cannot be empty"),
  })
);

const {
  handleSubmit,
  resetForm,
  values: commentFormValues,
} = useForm({
  validationSchema: commentSchema,
  initialValues: {
    content: "",
  },
});

// Handle comment submission
const onCommentSubmit = handleSubmit(async (values) => {
  if (!ticketId.value) return;
  const success = await ticketStore.addComment(ticketId.value, values.content);
  if (success) {
    resetForm();
    // Auto-scroll handled by watcher
  }
});

// Go back to the ticket list
const goBack = () => {
  router.push("/dashboard/tickets");
};
</script>

<template>
  <div>
    <!-- Back Button -->
    <Button variant="outline" @click="goBack" class="mb-4">
      <ArrowLeft class="mr-2 h-4 w-4" />
      Back to Tickets
    </Button>

    <!-- Loading State -->
    <div v-if="isLoadingDetails" class="flex justify-center py-12">
      <div
        class="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"
      ></div>
      <span class="sr-only">Loading ticket details...</span>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error && !currentTicket"
      class="p-6 text-center bg-card rounded-lg"
    >
      <AlertCircle class="mx-auto h-10 w-10 text-destructive mb-2" />
      <p class="text-destructive font-medium mb-1">
        Error Loading Ticket Details
      </p>
      <p class="text-muted-foreground">{{ error }}</p>
      <Button variant="outline" @click="goBack" class="mt-4">Go Back</Button>
    </div>

    <!-- Ticket Details & Comments -->
    <div v-else-if="currentTicket" class="space-y-6">
      <Card>
        <CardHeader>
          <div
            class="flex flex-col sm:flex-row sm:items-center justify-between gap-2"
          >
            <CardTitle class="text-2xl break-words">
              {{ currentTicket.subject }}
              <Badge variant="outline" class="ml-2 text-sm">
                #{{ currentTicket.ticketNumber }}
              </Badge>
            </CardTitle>
            <Badge :variant="getStatusBadgeVariant(currentTicket.status)">
              {{ currentTicket.status }}
            </Badge>
          </div>
          <CardDescription>
            Ticket opened on {{ formatDate(currentTicket.createdAt) }} at
            {{ formatTime(currentTicket.createdAt) }} by
            {{
              currentTicket.client?.name ||
              currentTicket.client?.email ||
              "Unknown Client"
            }}
          </CardDescription>
        </CardHeader>
      </Card>

      <!-- Comments Section -->
      <Card>
        <CardHeader>
          <CardTitle>Conversation</CardTitle>
        </CardHeader>
        <CardContent>
          <!-- Comment List -->
          <div
            ref="commentListRef"
            class="space-y-6 max-h-[500px] overflow-y-auto pr-4 pb-4 border-b mb-6"
          >
            <div
              v-for="comment in currentTicket.comments"
              :key="comment.id"
              class="flex gap-3"
            >
              <!-- Sender Avatar/Icon -->
              <Avatar class="h-8 w-8 border">
                <AvatarFallback>
                  <component
                    :is="getSenderIcon(comment.sender)"
                    class="h-4 w-4 text-muted-foreground"
                  />
                </AvatarFallback>
              </Avatar>
              <!-- Comment Bubble -->
              <div class="flex-1 space-y-1">
                <div class="flex items-center justify-between">
                  <p class="text-sm font-medium">
                    {{ getSenderName(comment.sender) }}
                    <span
                      v-if="comment.userId === user?.id"
                      class="text-xs text-muted-foreground"
                    >
                      (You)</span
                    >
                    <span
                      v-else-if="comment.sender === 'ADMIN'"
                      class="text-xs text-muted-foreground"
                    >
                      (Admin)</span
                    >
                  </p>
                  <p class="text-xs text-muted-foreground">
                    {{ formatDate(comment.createdAt) }}
                    {{ formatTime(comment.createdAt) }}
                  </p>
                </div>
                <div class="p-3 rounded-lg bg-muted/50">
                  <p class="text-sm whitespace-pre-line break-words">
                    {{ comment.content }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Add Comment Form -->
          <form @submit="onCommentSubmit">
            <FormField v-slot="{ componentField }" name="content">
              <FormItem>
                <FormLabel class="sr-only">Add Comment</FormLabel>
                <!-- Visually hidden label -->
                <FormControl>
                  <Textarea
                    placeholder="Type your comment here..."
                    rows="4"
                    v-bind="componentField"
                    class="mb-2"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>
            <div class="flex justify-end">
              <Button
                type="submit"
                :disabled="isAddingComment || !commentFormValues.content"
                class="gap-2"
              >
                <div
                  v-if="isAddingComment"
                  class="animate-spin h-4 w-4 border-2 border-background border-t-transparent rounded-full"
                ></div>
                <Send v-else class="h-4 w-4" />
                <span>Send Comment</span>
              </Button>
            </div>
            <!-- Display add comment error if any -->
            <p
              v-if="error && isAddingComment === false"
              class="text-destructive text-sm mt-2 text-right"
            >
              {{ error }}
            </p>
          </form>
        </CardContent>
      </Card>
    </div>

    <!-- Fallback if ticket somehow becomes null after loading? -->
    <div v-else class="p-6 text-center bg-card rounded-lg">
      <p class="text-muted-foreground">Ticket data not available.</p>
      <Button variant="outline" @click="goBack" class="mt-4">Go Back</Button>
    </div>
  </div>
</template>

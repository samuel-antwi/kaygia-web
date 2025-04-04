<script setup lang="ts">
import { ref, computed } from "vue";
import { useFetch } from "#app";
import {
  type SupportTicket,
  type TicketComment,
  type User as PrismaUser,
} from "@prisma/client";
import {
  AlertTriangle,
  Loader2,
  Send,
  CornerUpLeft,
  CheckCircle,
  Clock,
  ArrowLeft,
} from "lucide-vue-next";

definePageMeta({
  layout: "admin",
});

// Define the structure for a comment with its author details
interface CommentWithUser extends TicketComment {
  user: Pick<PrismaUser, "id" | "name" | "email" | "role"> | null;
}

// Define the structure for the ticket details returned by the API
interface DetailedTicket extends Omit<SupportTicket, "clientId" | "comments"> {
  client: Pick<PrismaUser, "id" | "name" | "email"> | null;
  comments: CommentWithUser[];
}

// Define the API response structure for a single ticket
interface ApiSingleTicketResponse {
  success: boolean;
  ticket?: DetailedTicket;
  message?: string;
}

// Define the API response structure for adding a comment
interface ApiCommentResponse {
  success: boolean;
  message?: string;
  comment?: TicketComment;
}

const route = useRoute();
const ticketId = computed(() => route.params.id as string);

// Fetch the specific ticket data
const { data, pending, error, refresh } =
  await useFetch<ApiSingleTicketResponse>(
    () => `/api/admin/tickets/${ticketId.value}`,
    {
      lazy: false,
      server: true,
      watch: [ticketId],
    }
  );

// Computed property for easier access to the ticket data
const ticket = computed(() => data.value?.ticket);

// --- Utility Functions ... ---
function formatDate(dateString: string | Date): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

// Accept string | undefined for status
function getStatusVariant(status?: string): string {
  if (!status) return "bg-gray-100 text-gray-800";
  switch (status) {
    case "OPEN": // Use string literal
      return "bg-blue-100 text-blue-800";
    case "PENDING": // Use string literal
      return "bg-yellow-100 text-yellow-800";
    case "RESOLVED": // Use string literal
      return "bg-cyan-100 text-cyan-800";
    case "CLOSED": // Use string literal
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

// Accept string | undefined for status
function getStatusIcon(status?: string) {
  if (!status) return Clock;
  switch (status) {
    case "OPEN": // Use string literal
      return Clock;
    case "PENDING": // Use string literal
      return CornerUpLeft;
    case "RESOLVED": // Use string literal
      return CheckCircle;
    case "CLOSED": // Use string literal
      return CheckCircle;
    default:
      return Clock;
  }
}

// --- Component State ---
const newComment = ref("");
const isSubmitting = ref(false);
const commentError = ref<string | null>(null); // Add state for comment errors

// --- Actions ---
async function addComment() {
  if (!newComment.value.trim() || !ticketId.value) return;

  isSubmitting.value = true;
  commentError.value = null; // Clear previous errors

  try {
    // Use $fetch for POST request, it handles errors better for actions
    const response = await $fetch<ApiCommentResponse>(
      `/api/admin/tickets/${ticketId.value}/comment`,
      {
        method: "POST",
        body: { content: newComment.value },
      }
    );

    if (response.success) {
      newComment.value = ""; // Clear the textarea
      await refresh(); // Refresh the ticket data to show the new comment
      // Optionally: scroll to bottom or show success toast
    } else {
      // Should ideally not happen if API throws error on failure, but handle just in case
      commentError.value = response.message || "An unknown error occurred.";
      console.error("API call succeeded but returned success: false", response);
    }
  } catch (err: any) {
    // Extract error message from the $fetch error response
    commentError.value =
      err.data?.statusMessage ||
      err.data?.message ||
      err.message ||
      "Failed to send reply.";
  } finally {
    isSubmitting.value = false;
  }
}

// Update status function (placeholder for now)
async function updateStatus(
  value: string | number | boolean | object | null | undefined
) {
  // Define valid statuses as strings
  const validStatuses: string[] = ["OPEN", "PENDING", "RESOLVED", "CLOSED"];
  if (typeof value === "string" && validStatuses.includes(value)) {
    const newStatus = value; // Value is already a valid status string
    // Actual API call logic will go here
    console.log("Updating status to:", newStatus);
  } else {
    console.warn(
      "Received invalid value from Select for status update:",
      value
    );
  }
}
</script>

<template>
  <div>
    <!-- Back Button -->
    <NuxtLink
      to="/admin/tickets"
      class="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
    >
      <ArrowLeft class="w-4 h-4 mr-1" />
      Back to Tickets
    </NuxtLink>

    <!-- 1. Loading State -->
    <div v-if="pending" class="flex items-center justify-center py-20">
      <Loader2 class="h-10 w-10 animate-spin text-muted-foreground" />
      <p class="ml-3 text-muted-foreground">Loading ticket details...</p>
    </div>

    <!-- 2. Error State -->
    <div
      v-else-if="error"
      class="p-6 bg-red-50 border border-red-200 rounded-md"
    >
      <div class="flex items-center">
        <AlertTriangle class="h-6 w-6 text-red-500 mr-3" />
        <div>
          <p class="text-red-700 font-semibold">Error Loading Ticket</p>
          <p class="text-red-600 mt-1 text-sm">
            {{
              error?.data?.statusMessage ||
              error?.data?.message ||
              error?.message ||
              "Could not load ticket data."
            }}
          </p>
        </div>
      </div>
      <Button @click="refresh" variant="outline" size="sm" class="mt-4"
        >Retry</Button
      >
    </div>

    <!-- 3. No Ticket Data State (after loading & no error) -->
    <div
      v-else-if="!ticket"
      class="text-center py-10 border border-dashed rounded-md"
    >
      <p class="text-muted-foreground">
        Ticket data could not be loaded or does not exist.
      </p>
      <!-- Optionally add a retry button here too -->
      <Button @click="refresh" variant="outline" size="sm" class="mt-3"
        >Retry</Button
      >
    </div>

    <!-- 4. Data Loaded State (Final v-else) -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left Column: Comments -->
      <div class="lg:col-span-2 space-y-4">
        <h2 class="text-2xl font-semibold">{{ ticket.subject }}</h2>

        <!-- Comment List -->
        <Card>
          <CardHeader>
            <CardTitle>Conversation</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div
              v-if="ticket.comments && ticket.comments.length > 0"
              class="space-y-4"
            >
              <div
                v-for="comment in ticket.comments"
                :key="comment.id"
                class="flex gap-3"
              >
                <Avatar class="mt-1">
                  <AvatarFallback
                    :class="
                      comment.sender === 'ADMIN'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    "
                  >
                    {{ comment.user?.name?.charAt(0)?.toUpperCase() || "U" }}
                  </AvatarFallback>
                </Avatar>
                <div
                  class="flex-1 p-3 rounded-md"
                  :class="
                    comment.sender === 'ADMIN' ? 'bg-primary/10' : 'bg-muted/70'
                  "
                >
                  <div class="flex justify-between items-center mb-1">
                    <p class="text-sm font-medium">
                      {{ comment.user?.name || "Unknown User" }}
                      <span
                        v-if="comment.sender === 'ADMIN'"
                        class="text-xs text-primary/80 ml-1"
                        >(Admin)</span
                      >
                      <span v-else class="text-xs text-muted-foreground ml-1"
                        >(Client)</span
                      >
                    </p>
                    <p class="text-xs text-muted-foreground">
                      {{ formatDate(comment.createdAt) }}
                    </p>
                  </div>
                  <p class="text-sm whitespace-pre-wrap">
                    {{ comment.content }}
                  </p>
                </div>
              </div>
            </div>
            <p v-else class="text-sm text-muted-foreground text-center py-4">
              No comments yet.
            </p>
          </CardContent>
        </Card>

        <!-- Add Comment Form -->
        <Card>
          <CardHeader>
            <CardTitle>Add Reply</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              v-model="newComment"
              placeholder="Type your reply here..."
              class="min-h-[100px] mb-3"
              :disabled="isSubmitting"
            />
            <!-- Display Comment Error -->
            <p v-if="commentError" class="text-red-600 text-sm mb-3">
              Error: {{ commentError }}
            </p>
            <Button
              @click="addComment"
              :disabled="!newComment.trim() || isSubmitting"
            >
              <Loader2 v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
              <Send v-else class="mr-2 h-4 w-4" />
              Send Reply
            </Button>
          </CardContent>
        </Card>
      </div>

      <!-- Right Column: Ticket Details & Actions -->
      <div class="lg:col-span-1 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Ticket Details</CardTitle>
          </CardHeader>
          <CardContent class="space-y-3 text-sm">
            <div class="flex justify-between">
              <span class="text-muted-foreground">Status:</span>
              <Badge
                :class="getStatusVariant(ticket.status)"
                variant="outline"
                class="flex items-center gap-1"
              >
                <component :is="getStatusIcon(ticket.status)" class="h-3 w-3" />
                {{ ticket.status }}
              </Badge>
            </div>
            <Separator />
            <div class="flex justify-between">
              <span class="text-muted-foreground">Client:</span>
              <span>{{ ticket.client?.name || "N/A" }}</span>
            </div>
            <div>
              <span class="text-muted-foreground block">Email:</span>
              <span>{{ ticket.client?.email || "N/A" }}</span>
            </div>
            <Separator />
            <div class="flex justify-between">
              <span class="text-muted-foreground">Created:</span>
              <span>{{ formatDate(ticket.createdAt) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">Last Updated:</span>
              <span>{{ formatDate(ticket.updatedAt) }}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent class="space-y-2">
            <p class="text-sm text-muted-foreground mb-2">
              Change ticket status:
            </p>
            <!-- Temporarily commented out Select component to resolve TS errors -->
            <!-- <Select
              @update:modelValue="updateStatus"
              :defaultValue="ticket.status"
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="status in Object.values(TicketStatus)"
                  :key="status"
                  :value="status"
                >
                  {{ status }}
                </SelectItem>
              </SelectContent>
            </Select> -->
            <p class="text-sm text-muted-foreground">
              (Status update UI temporarily disabled)
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Tailwind classes added in getStatusVariant */
.bg-blue-100 {
  background-color: #dbeafe;
}
.text-blue-800 {
  color: #1e40af;
}
.bg-yellow-100 {
  background-color: #fef9c3;
}
.text-yellow-800 {
  color: #854d0e;
}
.bg-cyan-100 {
  background-color: #cffafe;
} /* Added for RESOLVED */
.text-cyan-800 {
  color: #155e75;
} /* Added for RESOLVED */
.bg-green-100 {
  background-color: #dcfce7;
}
.text-green-800 {
  color: #166534;
}
.bg-gray-100 {
  background-color: #f3f4f6;
}
.text-gray-800 {
  color: #1f2937;
}
</style>

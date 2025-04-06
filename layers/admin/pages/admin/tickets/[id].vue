<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useFetch } from "#app";
import type { InferSelectModel } from "drizzle-orm";
import type { supportTickets, ticketComments, users } from "~/server/db/schema";
import { ticketStatusEnum } from "~/server/db/schema";
import { Role } from "../../../types/role"; // Import local Role enum
import { useToast } from "@/components/ui/toast/use-toast";
import {
  AlertTriangle,
  Loader2,
  Send,
  CornerUpLeft,
  CheckCircle,
  Clock,
  ArrowLeft,
  MessageSquare,
  Calendar,
  User,
} from "lucide-vue-next";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { NuxtLink } from "#components";

definePageMeta({
  layout: "admin",
});

// Define the structure for a comment with its author details
interface CommentWithUser extends InferSelectModel<typeof ticketComments> {
  user:
    | (Pick<InferSelectModel<typeof users>, "id" | "name" | "email"> & {
        role: Role;
      })
    | null;
}

// Define the structure for the ticket details returned by the API
interface DetailedTicket
  extends Omit<
    InferSelectModel<typeof supportTickets>,
    "clientId" | "comments"
  > {
  client: Pick<InferSelectModel<typeof users>, "id" | "name" | "email"> | null;
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
  comment?: InferSelectModel<typeof ticketComments>;
  statusChanged?: boolean;
}

// Define the API response structure for updating a ticket status
interface ApiStatusUpdateResponse {
  success: boolean;
  message?: string;
  ticket?: InferSelectModel<typeof supportTickets>;
}

// Define valid statuses as a constant array
const VALID_STATUSES = Object.freeze(
  ticketStatusEnum.enumValues
) as readonly string[];

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
  if (!status)
    return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
  switch (status) {
    case "OPEN": // Use string literal
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100";
    case "PENDING": // Use string literal
      return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100";
    case "RESOLVED": // Use string literal
      return "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-100";
    case "CLOSED": // Use string literal
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
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
const isUpdatingStatus = ref(false);
const statusError = ref<string | null>(null);
const currentStatus = ref<string | null>(null);
const { toast } = useToast();

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

      // Show success toast with status change info if applicable
      toast({
        title: "Reply Sent",
        description: response.statusChanged
          ? "Your reply has been added successfully. Ticket status automatically changed to PENDING."
          : "Your reply has been added successfully",
        variant: "default",
        duration: 5000,
      });
    } else {
      // Should ideally not happen if API throws error on failure, but handle just in case
      const errorMessage = response.message || "An unknown error occurred.";
      commentError.value = errorMessage;
      console.error("API call succeeded but returned success: false", response);

      // Show error toast
      toast({
        title: "Failed to Send",
        description: errorMessage,
        variant: "destructive",
        duration: 3000,
      });
    }
  } catch (err: any) {
    // Extract error message from the $fetch error response
    const errorMessage =
      err.data?.statusMessage ||
      err.data?.message ||
      err.message ||
      "Failed to send reply.";

    commentError.value = errorMessage;

    // Show error toast
    toast({
      title: "Error",
      description: errorMessage,
      variant: "destructive",
      duration: 3000,
    });
  } finally {
    isSubmitting.value = false;
  }
}

// Update status function
async function handleStatusUpdate() {
  if (!currentStatus.value || !ticketId.value) return;

  isUpdatingStatus.value = true;
  statusError.value = null;

  try {
    // Call the status update API endpoint
    const response = await $fetch<ApiStatusUpdateResponse>(
      `/api/admin/tickets/${ticketId.value}/status`,
      {
        method: "PUT",
        body: { status: currentStatus.value },
      }
    );

    if (response.success) {
      await refresh();
      // Show success toast notification
      toast({
        title: "Status Updated",
        description: `Ticket status changed to ${currentStatus.value}`,
        variant: "default",
        duration: 3000,
      });
    } else {
      const errorMessage = response.message || "Failed to update status.";
      statusError.value = errorMessage;

      // Show error toast
      toast({
        title: "Update Failed",
        description: errorMessage,
        variant: "destructive",
        duration: 3000,
      });
    }
  } catch (err: any) {
    const errorMessage =
      err.data?.statusMessage ||
      err.data?.message ||
      err.message ||
      "Failed to update ticket status.";

    statusError.value = errorMessage;
    console.error("Error updating ticket status:", err);

    // Show error toast
    toast({
      title: "Error",
      description: errorMessage,
      variant: "destructive",
      duration: 3000,
    });
  } finally {
    isUpdatingStatus.value = false;
  }
}

// Watch for ticket data changes to update current status
watch(
  () => ticket.value?.status,
  (newStatus) => {
    if (newStatus) {
      currentStatus.value = newStatus;
    }
  },
  { immediate: true }
);
</script>

<template>
  <div class="container mx-auto px-4 py-6 max-w-7xl">
    <!-- Back Button -->
    <NuxtLink
      to="/admin/tickets"
      class="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors mb-6 group"
    >
      <ArrowLeft
        class="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform"
      />
      Back to Tickets
    </NuxtLink>

    <!-- 1. Loading State -->
    <div v-if="pending" class="flex flex-col items-center justify-center py-20">
      <Loader2 class="h-12 w-12 animate-spin text-primary mb-4" />
      <p class="text-muted-foreground text-lg">Loading ticket details...</p>
    </div>

    <!-- 2. Error State -->
    <div
      v-else-if="error"
      class="p-8 bg-destructive/10 border border-destructive/20 rounded-lg shadow-sm"
    >
      <div class="flex items-center">
        <AlertTriangle class="h-8 w-8 text-destructive mr-4 flex-shrink-0" />
        <div>
          <p class="text-destructive font-semibold text-lg">
            Error Loading Ticket
          </p>
          <p class="text-destructive/80 mt-2">
            {{
              error?.data?.statusMessage ||
              error?.data?.message ||
              error?.message ||
              "Could not load ticket data."
            }}
          </p>
        </div>
      </div>
      <Button @click="refresh" variant="outline" size="sm" class="mt-6">
        Retry
      </Button>
    </div>

    <!-- 3. No Ticket Data State (after loading & no error) -->
    <div
      v-else-if="!ticket"
      class="text-center py-16 border border-dashed rounded-lg bg-muted/30"
    >
      <p class="text-muted-foreground text-lg mb-4">
        Ticket data could not be loaded or does not exist.
      </p>
      <Button @click="refresh" variant="outline" size="sm">Retry</Button>
    </div>

    <!-- 4. Data Loaded State (Final v-else) -->
    <div v-else>
      <!-- Ticket Header -->
      <div class="mb-8">
        <div
          class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4"
        >
          <div>
            <div class="flex items-center gap-3 mb-2">
              <h1 class="text-2xl md:text-3xl font-bold">
                {{ ticket.subject }}
              </h1>
              <Badge variant="outline" class="text-xs md:text-sm h-6 px-2">
                #{{ ticket.ticketNumber || "N/A" }}
              </Badge>
            </div>
            <div
              class="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground"
            >
              <div class="flex items-center">
                <Calendar class="h-4 w-4 mr-2" />
                <span>{{ formatDate(ticket.createdAt) }}</span>
              </div>
              <div class="flex items-center">
                <User class="h-4 w-4 mr-2" />
                <span>{{ ticket.client?.name || "Unknown" }}</span>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-3 self-start md:self-center">
            <Badge
              :class="[getStatusVariant(ticket.status)]"
              class="flex items-center gap-1.5 h-8 px-3 text-xs font-medium rounded-full"
            >
              <component
                :is="getStatusIcon(ticket.status)"
                class="h-3.5 w-3.5"
              />
              {{ ticket.status }}
            </Badge>

            <Select
              v-model="currentStatus"
              @update:model-value="handleStatusUpdate"
              :disabled="isUpdatingStatus"
            >
              <SelectTrigger class="w-36 h-9">
                <SelectValue placeholder="Change Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="status in VALID_STATUSES"
                  :key="status"
                  :value="status"
                  :disabled="status === ticket.status"
                >
                  {{ status }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <!-- Status Update Feedback -->
        <div
          v-if="isUpdatingStatus"
          class="flex justify-center items-center py-2 bg-primary/5 rounded-md"
        >
          <Loader2 class="h-4 w-4 animate-spin text-primary mr-2" />
          <span class="text-sm">Updating status...</span>
        </div>

        <div
          v-if="statusError"
          class="p-4 bg-destructive/10 border border-destructive/20 rounded-md mt-2"
        >
          <div class="flex items-center">
            <AlertTriangle
              class="h-5 w-5 text-destructive mr-2 flex-shrink-0"
            />
            <p class="text-sm font-medium text-destructive">
              {{ statusError }}
            </p>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left Column: Conversation -->
        <div class="lg:col-span-2 space-y-6">
          <Card class="shadow-sm border-muted/60">
            <CardHeader class="pb-3 border-b">
              <CardTitle class="flex items-center text-xl">
                <MessageSquare class="h-5 w-5 mr-2" />
                Conversation
              </CardTitle>
            </CardHeader>
            <CardContent class="p-0">
              <div
                v-if="ticket.comments && ticket.comments.length > 0"
                class="divide-y divide-border"
              >
                <div
                  v-for="comment in ticket.comments"
                  :key="comment.id"
                  class="p-5"
                >
                  <div class="flex gap-4">
                    <Avatar class="h-10 w-10 border">
                      <AvatarFallback
                        :class="
                          comment.sender === 'ADMIN'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        "
                      >
                        {{
                          comment.user?.name?.charAt(0)?.toUpperCase() || "U"
                        }}
                      </AvatarFallback>
                    </Avatar>
                    <div class="flex-1">
                      <div
                        class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 mb-2"
                      >
                        <div class="flex items-center">
                          <p class="font-medium">
                            {{ comment.user?.name || "Unknown User" }}
                          </p>
                          <Badge
                            variant="outline"
                            :class="
                              comment.sender === 'ADMIN'
                                ? 'text-primary border-primary/30 bg-primary/5'
                                : 'text-muted-foreground'
                            "
                            class="ml-2 text-xs h-5 px-1.5"
                          >
                            {{
                              comment.sender === "ADMIN" ? "Admin" : "Client"
                            }}
                          </Badge>
                        </div>
                        <p class="text-xs text-muted-foreground">
                          {{ formatDate(comment.createdAt) }}
                        </p>
                      </div>
                      <div
                        class="text-sm rounded-lg p-4"
                        :class="
                          comment.sender === 'ADMIN'
                            ? 'bg-primary/5 dark:bg-primary/10'
                            : 'bg-muted/50 dark:bg-muted/30'
                        "
                      >
                        <p class="whitespace-pre-wrap">{{ comment.content }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div
                v-else
                class="flex flex-col items-center justify-center py-12 px-4 text-center"
              >
                <MessageSquare
                  class="h-12 w-12 text-muted-foreground/40 mb-4"
                />
                <p class="text-muted-foreground">No comments yet.</p>
              </div>
            </CardContent>
          </Card>

          <!-- Add Comment Form -->
          <Card class="shadow-sm border-muted/60">
            <CardHeader class="pb-3 border-b">
              <CardTitle class="text-xl">Add Reply</CardTitle>
            </CardHeader>
            <CardContent class="p-5">
              <Textarea
                v-model="newComment"
                placeholder="Type your reply here..."
                class="min-h-[120px] mb-4 resize-y"
                :disabled="isSubmitting"
              />
              <!-- Display Comment Error -->
              <div
                v-if="commentError"
                class="p-3 bg-destructive/10 border border-destructive/20 rounded-md mb-4"
              >
                <div class="flex items-center">
                  <AlertTriangle
                    class="h-4 w-4 text-destructive mr-2 flex-shrink-0"
                  />
                  <p class="text-sm text-destructive">
                    {{ commentError }}
                  </p>
                </div>
              </div>
              <Button
                @click="addComment"
                :disabled="!newComment.trim() || isSubmitting"
                class="w-full sm:w-auto"
              >
                <Loader2
                  v-if="isSubmitting"
                  class="mr-2 h-4 w-4 animate-spin"
                />
                <Send v-else class="mr-2 h-4 w-4" />
                Send Reply
              </Button>
            </CardContent>
          </Card>
        </div>

        <!-- Right Column: Ticket Info -->
        <div class="lg:col-span-1">
          <Card class="shadow-sm border-muted/60 sticky top-4">
            <CardHeader class="pb-3 border-b">
              <CardTitle class="text-xl">Ticket Information</CardTitle>
            </CardHeader>
            <CardContent class="p-5">
              <div class="space-y-4">
                <div>
                  <h3 class="text-sm font-medium text-muted-foreground mb-1">
                    Ticket Number
                  </h3>
                  <p class="font-mono">{{ ticket.ticketNumber || "N/A" }}</p>
                </div>

                <div>
                  <h3 class="text-sm font-medium text-muted-foreground mb-1">
                    Client
                  </h3>
                  <div class="flex items-center">
                    <Avatar class="h-6 w-6 mr-2">
                      <AvatarFallback class="text-xs">
                        {{
                          ticket.client?.name?.charAt(0)?.toUpperCase() || "?"
                        }}
                      </AvatarFallback>
                    </Avatar>
                    <p>{{ ticket.client?.name || "Unknown" }}</p>
                  </div>
                  <p
                    v-if="ticket.client?.email"
                    class="text-sm text-muted-foreground mt-1"
                  >
                    {{ ticket.client.email }}
                  </p>
                </div>

                <div>
                  <h3 class="text-sm font-medium text-muted-foreground mb-1">
                    Created
                  </h3>
                  <p>{{ formatDate(ticket.createdAt) }}</p>
                </div>

                <div>
                  <h3 class="text-sm font-medium text-muted-foreground mb-1">
                    Status
                  </h3>
                  <Badge
                    :class="[getStatusVariant(ticket.status)]"
                    class="flex items-center gap-1.5 h-7 px-2.5 text-xs font-medium"
                  >
                    <component
                      :is="getStatusIcon(ticket.status)"
                      class="h-3.5 w-3.5"
                    />
                    {{ ticket.status }}
                  </Badge>
                </div>

                <div v-if="ticket.comments?.length">
                  <h3 class="text-sm font-medium text-muted-foreground mb-1">
                    Activity
                  </h3>
                  <p class="text-sm">
                    <span class="font-medium">{{
                      ticket.comments.length
                    }}</span>
                    {{ ticket.comments.length === 1 ? "reply" : "replies" }}
                  </p>
                  <p class="text-sm text-muted-foreground mt-1">
                    Last update:
                    {{
                      formatDate(
                        ticket.comments[ticket.comments.length - 1].createdAt
                      )
                    }}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Dark mode support for status badges */
.bg-blue-100 {
  background-color: #dbeafe;
}
.text-blue-800 {
  color: #1e40af;
}
.dark .bg-blue-900 {
  background-color: rgba(30, 58, 138, 0.3);
}
.dark .text-blue-100 {
  color: #dbeafe;
}

.bg-amber-100 {
  background-color: #fef3c7;
}
.text-amber-800 {
  color: #92400e;
}
.dark .bg-amber-900 {
  background-color: rgba(120, 53, 15, 0.3);
}
.dark .text-amber-100 {
  color: #fef3c7;
}

.bg-cyan-100 {
  background-color: #cffafe;
}
.text-cyan-800 {
  color: #155e75;
}
.dark .bg-cyan-900 {
  background-color: rgba(22, 78, 99, 0.3);
}
.dark .text-cyan-100 {
  color: #cffafe;
}

.bg-emerald-100 {
  background-color: #d1fae5;
}
.text-emerald-800 {
  color: #065f46;
}
.dark .bg-emerald-900 {
  background-color: rgba(6, 78, 59, 0.3);
}
.dark .text-emerald-100 {
  color: #d1fae5;
}

.bg-gray-100 {
  background-color: #f3f4f6;
}
.text-gray-800 {
  color: #1f2937;
}
.dark .bg-gray-800 {
  background-color: rgba(31, 41, 55, 0.3);
}
.dark .text-gray-200 {
  color: #e5e7eb;
}
</style>

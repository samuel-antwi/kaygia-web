// New empty file content, old file will be deleted

import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { InferSelectModel } from "drizzle-orm";
import type { supportTickets, ticketComments, users } from "~/server/db/schema";

// Define interfaces for API responses
interface TicketListItem extends InferSelectModel<typeof supportTickets> {
  _count: {
    comments: number;
  };
  client: Pick<InferSelectModel<typeof users>, "id" | "name" | "email"> | null;
}

interface TicketComment extends InferSelectModel<typeof ticketComments> {
  user: Pick<InferSelectModel<typeof users>, "id" | "name" | "email"> | null;
  senderName?: string;
}

interface TicketDetails extends InferSelectModel<typeof supportTickets> {
  comments: TicketComment[];
  client: Pick<InferSelectModel<typeof users>, "id" | "name" | "email"> | null;
}

interface ApiTicketListResponse {
  success: boolean;
  tickets?: TicketListItem[];
  message?: string;
}

interface ApiTicketDetailsResponse {
  success: boolean;
  ticket?: TicketDetails;
  message?: string;
}

interface ApiCommentResponse {
  success: boolean;
  message?: string;
  comment?: TicketComment;
}

export const useTicketStore = defineStore("tickets", () => {
  // State
  const tickets = ref<TicketListItem[]>([]);
  const currentTicket = ref<TicketDetails | null>(null);
  const isLoadingList = ref(false);
  const isLoadingDetails = ref(false);
  const isAddingComment = ref(false);
  const isCreatingTicket = ref(false);
  const error = ref<string | null>(null);

  // Actions
  const fetchTickets = async () => {
    isLoadingList.value = true;
    error.value = null;
    try {
      const response = await $fetch<ApiTicketListResponse>("/api/tickets", {
        headers: { "Cache-Control": "no-cache" },
      });
      if (response.success) {
        tickets.value = response.tickets || [];
      } else {
        throw new Error("API indicated failure fetching tickets");
      }
    } catch (err: any) {
      error.value =
        err.data?.statusMessage || err.message || "Failed to fetch tickets";
      console.error("Error fetching tickets:", err);
    } finally {
      isLoadingList.value = false;
    }
  };

  const fetchTicketDetails = async (ticketId: string) => {
    if (!ticketId) return;

    isLoadingDetails.value = true;
    error.value = null;
    try {
      const response = await $fetch<ApiTicketDetailsResponse>(
        `/api/tickets/${ticketId}`,
        {
          headers: { "Cache-Control": "no-cache" },
        }
      );
      if (response.success && response.ticket) {
        currentTicket.value = response.ticket;
      } else {
        throw new Error("API indicated failure fetching ticket details");
      }
    } catch (err: any) {
      error.value =
        err.data?.statusMessage ||
        err.message ||
        "Failed to fetch ticket details";
      console.error("Error fetching ticket details:", err);
      currentTicket.value = null;
    } finally {
      isLoadingDetails.value = false;
    }
  };

  const createTicket = async (
    subject: string,
    content: string
  ): Promise<boolean> => {
    if (!subject || !content.trim()) return false;

    isCreatingTicket.value = true;
    error.value = null;
    try {
      const response = await $fetch<{
        success: boolean;
        ticket?: TicketListItem;
        message?: string;
      }>("/api/tickets", {
        method: "POST",
        body: { subject, content },
      });

      if (response.success) {
        await fetchTickets(); // Refresh the list
        return true;
      } else {
        throw new Error(response.message || "Failed to create ticket");
      }
    } catch (err: any) {
      error.value =
        err.data?.statusMessage || err.message || "Failed to create ticket";
      console.error("Error creating ticket:", err);
      return false;
    } finally {
      isCreatingTicket.value = false;
    }
  };

  const addComment = async (ticketId: string, content: string) => {
    if (!ticketId || !content.trim()) return;

    isAddingComment.value = true;
    error.value = null;
    try {
      const response = await $fetch<ApiCommentResponse>(
        `/api/tickets/${ticketId}/comment`,
        {
          method: "POST",
          body: { content },
        }
      );

      if (response.success) {
        // Refresh ticket details to get the new comment
        await fetchTicketDetails(ticketId);
        return true;
      } else {
        throw new Error(response.message || "Failed to add comment");
      }
    } catch (err: any) {
      error.value =
        err.data?.statusMessage || err.message || "Failed to add comment";
      console.error("Error adding comment:", err);
      return false;
    } finally {
      isAddingComment.value = false;
    }
  };

  // Computed
  const sortedTickets = computed(() => {
    return [...tickets.value].sort((a, b) => {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  });

  // Return store properties and methods
  return {
    // State
    tickets,
    currentTicket,
    isLoadingList,
    isLoadingDetails,
    isAddingComment,
    isCreatingTicket,
    error,
    // Actions
    fetchTickets,
    fetchTicketDetails,
    createTicket,
    addComment,
    // Computed
    sortedTickets,
  };
});

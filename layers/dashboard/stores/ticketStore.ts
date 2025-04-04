// New empty file content, old file will be deleted

import { defineStore } from "pinia";
import type { SupportTicket, TicketComment } from "@prisma/client";

// Define interfaces for the shape of data returned by our API
// (Prisma types + potential nested data)

// Type for the ticket list item
interface TicketListItem extends Omit<SupportTicket, "clientId"> {
  _count: {
    comments: number;
  };
}

// Type for the detailed ticket view (includes comments with user names)
interface TicketCommentWithUser extends TicketComment {
  user: { name: string | null; id: string };
}
interface TicketDetails extends SupportTicket {
  comments: TicketCommentWithUser[];
  client: { name: string | null; email: string };
}

export const useTicketStore = defineStore("ticket", () => {
  // === STATE ===
  const tickets = ref<TicketListItem[]>([]); // List of tickets for the main page
  const currentTicket = ref<TicketDetails | null>(null); // Holds the currently viewed ticket details + comments
  const isLoadingList = ref(false);
  const isLoadingDetails = ref(false);
  const isCreatingTicket = ref(false);
  const isAddingComment = ref(false);
  const error = ref<string | null>(null);

  // === ACTIONS ===

  // Fetch the list of tickets for the dashboard
  async function fetchTickets() {
    isLoadingList.value = true;
    error.value = null;
    try {
      const response = await $fetch<{
        success: boolean;
        tickets: TicketListItem[];
      }>("/api/tickets", {
        headers: { "Cache-Control": "no-cache" },
      });
      if (response.success) {
        tickets.value = response.tickets;
      } else {
        throw new Error("API indicated failure fetching tickets");
      }
    } catch (err: any) {
      error.value =
        err.data?.statusMessage || err.message || "Failed to fetch tickets";
      console.error("Error fetching tickets:", err);
      tickets.value = []; // Clear list on error
    } finally {
      isLoadingList.value = false;
    }
  }

  // Fetch details for a single ticket (including comments)
  async function fetchTicketDetails(ticketId: string) {
    isLoadingDetails.value = true;
    error.value = null;
    currentTicket.value = null; // Clear previous details
    try {
      const response = await $fetch<{
        success: boolean;
        ticket: TicketDetails;
      }>(`/api/tickets/${ticketId}`, {
        headers: { "Cache-Control": "no-cache" },
      });
      if (response.success) {
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
    } finally {
      isLoadingDetails.value = false;
    }
  }

  // Create a new support ticket
  async function createTicket(
    subject: string,
    content: string
  ): Promise<boolean> {
    isCreatingTicket.value = true;
    error.value = null;
    try {
      const response = await $fetch<{
        success: boolean;
        ticket?: Partial<SupportTicket>; // API returns partial ticket info
        error?: string;
      }>("/api/tickets", {
        method: "POST",
        body: { subject, content },
        headers: { "Cache-Control": "no-cache" },
      });

      if (response.success && response.ticket) {
        // Optionally refresh the list or navigate
        await fetchTickets(); // Refresh the main list
        return true;
      } else {
        throw new Error(
          response.error || "API indicated failure creating ticket"
        );
      }
    } catch (err: any) {
      error.value =
        err.data?.statusMessage || err.message || "Failed to create ticket";
      console.error("Error creating ticket:", err);
      return false;
    } finally {
      isCreatingTicket.value = false;
    }
  }

  // Add a comment to an existing ticket
  async function addComment(
    ticketId: string,
    content: string
  ): Promise<boolean> {
    if (!currentTicket.value || currentTicket.value.id !== ticketId) {
      console.warn(
        "Attempted to add comment but currentTicket doesn't match ticketId"
      );
      // Fetch details if missing? Or rely on UI context?
      // For now, we assume the relevant ticket details are loaded in currentTicket
      // await fetchTicketDetails(ticketId);
      // if (!currentTicket.value) return false;
      error.value = "Cannot add comment: Ticket details not loaded correctly.";
      return false;
    }

    isAddingComment.value = true;
    error.value = null;
    try {
      const response = await $fetch<{
        success: boolean;
        comment?: TicketCommentWithUser;
        error?: string;
      }>(`/api/tickets/${ticketId}/comment`, {
        method: "POST",
        body: { content },
        headers: { "Cache-Control": "no-cache" },
      });

      if (response.success && response.comment) {
        // Add the new comment to the current ticket's comment list
        if (currentTicket.value) {
          currentTicket.value.comments.push(response.comment);
          // Update ticket status and last replied time locally
          currentTicket.value.lastRepliedAt = new Date(
            response.comment.createdAt
          );
          if (currentTicket.value.status === "PENDING") {
            currentTicket.value.status = "OPEN";
          }
        }
        return true;
      } else {
        throw new Error(
          response.error || "API indicated failure adding comment"
        );
      }
    } catch (err: any) {
      error.value =
        err.data?.statusMessage || err.message || "Failed to add comment";
      console.error("Error adding comment:", err);
      return false;
    } finally {
      isAddingComment.value = false;
    }
  }

  // === GETTERS ===
  const sortedTickets = computed(() => {
    // Keep the same sorting logic as before, but on tickets
    return [...tickets.value].sort((a, b) => {
      return (
        new Date(b.lastRepliedAt).getTime() -
        new Date(a.lastRepliedAt).getTime()
      );
    });
  });

  // Removed unreadCount, adminMessages, clientMessages as they don't directly map

  // === RETURN ===
  return {
    // State
    tickets,
    currentTicket,
    isLoadingList,
    isLoadingDetails,
    isCreatingTicket,
    isAddingComment,
    error,
    // Actions
    fetchTickets,
    fetchTicketDetails,
    createTicket,
    addComment,
    // Getters
    sortedTickets,
  };
});

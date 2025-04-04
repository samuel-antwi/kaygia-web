// New empty file content, old file will be deleted

import { MessagesSquare, UserCircle } from "lucide-vue-next";
import { computed } from "vue";
import type { InferSelectModel } from "drizzle-orm";
import type { supportTickets } from "~/server/db/schema";

export function useTicketUtils() {
  // Function to format date
  function formatDate(date: string | Date): string {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  // Function to get status color class
  function getStatusColor(
    status: InferSelectModel<typeof supportTickets>["status"]
  ) {
    switch (status) {
      case "OPEN":
        return "text-green-600 dark:text-green-400";
      case "PENDING":
        return "text-yellow-600 dark:text-yellow-400";
      case "RESOLVED":
        return "text-blue-600 dark:text-blue-400";
      case "CLOSED":
        return "text-gray-600 dark:text-gray-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  }

  // Format time
  const formatTime = (dateString: string | Date | undefined | null): string => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      return date.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      console.error("Error formatting time:", dateString, e);
      return "";
    }
  };

  // Get sender icon component (Maybe adjust based on TicketComment structure if needed)
  const getSenderIcon = (sender: string | undefined | null) => {
    return sender === "ADMIN" ? MessagesSquare : UserCircle;
  };

  // Get sender name (Maybe adjust based on TicketComment structure if needed)
  const getSenderName = (sender: string | undefined | null): string => {
    return sender === "ADMIN" ? "Admin" : "You";
  };

  // Helper to get badge variant based on status
  const getStatusBadgeVariant = (
    status: InferSelectModel<typeof supportTickets>["status"]
  ) => {
    switch (status) {
      case "OPEN":
      case "PENDING":
        return "default";
      case "RESOLVED":
        return "secondary";
      case "CLOSED":
        return "outline";
      default:
        return "outline";
    }
  };

  return {
    formatDate,
    formatTime,
    getSenderIcon,
    getSenderName,
    getStatusBadgeVariant,
    getStatusColor,
  };
}

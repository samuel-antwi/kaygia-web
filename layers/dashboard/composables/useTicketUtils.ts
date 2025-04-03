// New empty file content, old file will be deleted

import { MessagesSquare, UserCircle } from "lucide-vue-next";
import type { TicketStatus } from "@prisma/client"; // Import enum

export const useTicketUtils = () => {
  // Format date
  const formatDate = (dateString: string | Date | undefined | null): string => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch (e) {
      console.error("Error formatting date:", dateString, e);
      return "";
    }
  };

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
  const getStatusBadgeVariant = (status: TicketStatus) => {
    switch (status) {
      case "OPEN":
      case "PENDING":
        return "default"; // Or maybe 'destructive' for OPEN?
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
    getStatusBadgeVariant, // Export the new helper
  };
};

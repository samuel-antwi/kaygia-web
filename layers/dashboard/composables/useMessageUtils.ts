import { MessagesSquare, UserCircle } from "lucide-vue-next";

export const useMessageUtils = () => {
  // Format date
  const formatDate = (dateString: string | undefined | null): string => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "";
      }
      return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch (e) {
      console.error("Error formatting date:", dateString, e);
      return ""; // Return empty string on error
    }
  };

  // Format time
  const formatTime = (dateString: string | undefined | null): string => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "";
      }
      return date.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      console.error("Error formatting time:", dateString, e);
      return ""; // Return empty string on error
    }
  };

  // Get sender icon component
  const getSenderIcon = (sender: string | undefined | null) => {
    return sender === "ADMIN" ? MessagesSquare : UserCircle;
  };

  // Get sender name
  const getSenderName = (sender: string | undefined | null): string => {
    return sender === "ADMIN" ? "Admin" : "You";
  };

  return {
    formatDate,
    formatTime,
    getSenderIcon,
    getSenderName,
  };
};

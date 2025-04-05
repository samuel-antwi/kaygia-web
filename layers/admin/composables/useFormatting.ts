/**
 * Composable for common formatting functions used throughout the admin interface
 */
export function useFormatting() {
  /**
   * Format a date string into a localized date format
   */
  const formatDate = (dateString: string | Date | null | undefined): string => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  /**
   * Get the appropriate CSS class for a ticket status
   */
  const getTicketStatusColor = (status: string) => {
    switch (status) {
      case "OPEN":
        return "text-blue-600";
      case "PENDING":
        return "text-amber-600";
      case "RESOLVED":
        return "text-cyan-600";
      case "CLOSED":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  /**
   * Get the appropriate CSS class for a project status
   */
  const getProjectStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "text-amber-600";
      case "APPROVED":
        return "text-blue-600";
      case "IN_PROGRESS":
        return "text-purple-600";
      case "REVIEW":
        return "text-cyan-600";
      case "COMPLETED":
        return "text-green-600";
      case "CANCELLED":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return {
    formatDate,
    getTicketStatusColor,
    getProjectStatusColor,
  };
}

<script setup lang="ts">
import { ref, computed } from "vue";
import { type SupportTicket, type User as ClientUser } from "@prisma/client";
import { AlertTriangle, Loader2 } from "lucide-vue-next";

definePageMeta({
  layout: "admin",
});

// Define the expected structure of a ticket returned by our admin API
// Includes the client details and comment count
interface AdminTicket extends Omit<SupportTicket, "clientId"> {
  client: Pick<ClientUser, "id" | "name" | "email"> | null;
  _count: {
    comments: number;
  };
}

// Define the expected API response structure
interface ApiResponse {
  success: boolean;
  tickets?: AdminTicket[];
  message?: string; // Optional error message
}

const { data, pending, error, refresh } = await useFetch<ApiResponse>(
  "/api/admin/tickets",
  {
    lazy: false, // Fetch data before navigating
    server: true, // Ensure it runs server-side initially
  }
);

// Computed property for easier access to tickets, handles potential null/undefined data
const tickets = computed(() => data.value?.tickets ?? []);

// Utility to format date (can be extracted later)
function formatDate(dateString: string | Date): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// Utility to get status variant (updated based on schema)
function getStatusVariant(status: string): string {
  switch (status) {
    case "OPEN":
      return "bg-blue-100 text-blue-800";
    case "PENDING":
      return "bg-yellow-100 text-yellow-800";
    case "RESOLVED":
      return "bg-cyan-100 text-cyan-800";
    case "CLOSED":
      return "bg-green-100 text-green-800";
    default:
      console.warn(`Unknown ticket status: ${status}`);
      return "bg-gray-100 text-gray-800";
  }
}

// Function to navigate to ticket detail page
function viewTicket(ticketId: string) {
  navigateTo(`/admin/tickets/${ticketId}`);
}
</script>

<template>
  <div>
    <h2 class="text-2xl font-semibold mb-4">Manage Tickets</h2>

    <!-- Loading State -->
    <div v-if="pending" class="flex items-center justify-center py-10">
      <Loader2 class="h-8 w-8 animate-spin text-muted-foreground" />
      <p class="ml-2 text-muted-foreground">Loading tickets...</p>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="p-4 bg-red-50 border border-red-200 rounded-md"
    >
      <div class="flex items-center">
        <AlertTriangle class="h-5 w-5 text-red-500 mr-2" />
        <p class="text-red-700 font-medium">Error loading tickets:</p>
      </div>
      <p class="text-red-600 mt-1 text-sm">
        {{ error.message || "An unknown error occurred." }}
      </p>
      <Button @click="refresh" variant="outline" size="sm" class="mt-3"
        >Retry</Button
      >
    </div>

    <!-- Data Loaded State -->
    <div v-else-if="tickets.length > 0">
      <Card>
        <CardContent class="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead class="text-center">Comments</TableHead>
                <TableHead class="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="ticket in tickets" :key="ticket.id">
                <TableCell class="font-medium">{{ ticket.subject }}</TableCell>
                <TableCell
                  >{{ ticket.client?.name || "N/A" }}
                  <span class="text-xs text-muted-foreground"
                    >({{ ticket.client?.email || "-" }})</span
                  ></TableCell
                >
                <TableCell>
                  <Badge
                    :class="getStatusVariant(ticket.status)"
                    variant="outline"
                  >
                    {{ ticket.status }}
                  </Badge>
                </TableCell>
                <TableCell>{{ formatDate(ticket.createdAt) }}</TableCell>
                <TableCell class="text-center">{{
                  ticket._count?.comments ?? 0
                }}</TableCell>
                <TableCell class="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    @click="viewTicket(ticket.id)"
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>

    <!-- No Data State -->
    <div v-else class="text-center py-10 border border-dashed rounded-md">
      <p class="text-muted-foreground">No tickets found.</p>
      <!-- Optional: Add a button to create a ticket if admins can do that -->
    </div>
  </div>
</template>

<style scoped>
/* Add component-specific styles if needed */
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
}
.text-cyan-800 {
  color: #155e75;
}
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

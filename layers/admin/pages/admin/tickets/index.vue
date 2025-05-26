<script setup lang="ts">
import { ref, computed } from "vue";
import { AlertTriangle, Loader2, Search } from "lucide-vue-next";
import { Role } from "../../../types/role"; // Import local Role enum
import type { InferSelectModel } from "drizzle-orm";
import type { supportTickets, users } from "../../../../../server/db/schema";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { hasAdminAccess } from "#layers/admin/utils/adminAccess";

definePageMeta({
  layout: "admin",
});

const { user, loading } = useAuth();

// Define the expected structure of a ticket returned by our admin API
// Includes the client details and comment count
interface AdminTicket
  extends Omit<InferSelectModel<typeof supportTickets>, "clientId"> {
  client: Pick<InferSelectModel<typeof users>, "id" | "name" | "email"> | null;
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

// Search query
const searchQuery = ref("");

// Fetch tickets data
const { data, pending, error, refresh } = await useFetch<ApiResponse>(
  "/api/admin/tickets",
  {
    lazy: false, // Fetch data before navigating
    server: true, // Ensure it runs server-side initially
  }
);

// Computed property for easier access to the tickets array
const allTickets = computed(() => data.value?.tickets || []);

// Filtered tickets based on search query
const tickets = computed(() => {
  if (!searchQuery.value.trim()) return allTickets.value;

  const query = searchQuery.value.toLowerCase().trim();

  return allTickets.value.filter(
    (ticket) =>
      ticket.subject.toLowerCase().includes(query) ||
      ticket.ticketNumber?.includes(query) ||
      ticket.client?.name?.toLowerCase().includes(query) ||
      ticket.client?.email?.toLowerCase().includes(query)
  );
});

// Function to format date
const formatDate = (date: string | Date) => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Function to get status color class
const getStatusColor = (status: string) => {
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
};

// Function to navigate to ticket detail page
function viewTicket(ticketId: string) {
  navigateTo(`/admin/tickets/${ticketId}`);
}

// Reset search
function clearSearch() {
  searchQuery.value = "";
}
</script>

<template>
  <div class="space-y-6">
    <!-- Only show content if user is loaded and confirmed ADMIN -->
    <div v-if="!loading && user && hasAdminAccess(user.role)">
      <div
        class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6"
      >
        <div>
          <h1 class="text-2xl font-bold tracking-tight">Support Tickets</h1>
          <p class="text-muted-foreground">
            View and manage all support tickets
          </p>
        </div>
        <Button @click="refresh" variant="outline" size="sm" class="h-10">
          <span v-if="pending">
            <Loader2 class="mr-2 h-4 w-4 animate-spin" />
            Refreshing
          </span>
          <span v-else>Refresh</span>
        </Button>
      </div>

      <!-- Search Bar -->
      <div class="relative mb-6">
        <div class="relative w-full">
          <Search
            class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
          />
          <Input
            v-model="searchQuery"
            type="search"
            placeholder="Search by ticket number, subject, or client..."
            class="pl-8 w-full"
          />
          <Button
            v-if="searchQuery"
            variant="ghost"
            size="sm"
            class="absolute right-2 top-1.5"
            @click="clearSearch"
          >
            Clear
          </Button>
        </div>
      </div>

      <!-- Loading state -->
      <div v-if="pending" class="flex items-center justify-center py-8">
        <Loader2 class="h-8 w-8 animate-spin text-muted-foreground" />
        <p class="ml-3 text-muted-foreground">Loading tickets...</p>
      </div>

      <!-- Error state -->
      <div
        v-else-if="error"
        class="p-6 bg-destructive/10 border border-destructive/20 rounded-lg"
      >
        <div class="flex items-center">
          <AlertTriangle class="h-6 w-6 text-destructive mr-3" />
          <div>
            <p class="font-semibold text-destructive">Error Loading Tickets</p>
            <p class="text-destructive/90 mt-1 text-sm">
              {{
                error?.data?.statusMessage ||
                error?.data?.message ||
                error?.message ||
                "Could not load tickets data."
              }}
            </p>
          </div>
        </div>
        <Button
          @click="refresh"
          variant="outline"
          size="sm"
          class="mt-4 border-destructive/40 text-destructive"
        >
          Retry
        </Button>
      </div>

      <!-- No Tickets State -->
      <div
        v-else-if="allTickets.length === 0"
        class="text-center py-8 border border-dashed rounded-lg"
      >
        <h3 class="mt-4 text-lg font-semibold">No tickets available</h3>
        <p class="text-muted-foreground mt-2">
          There are no support tickets in the system.
        </p>
      </div>

      <!-- No Search Results -->
      <div
        v-else-if="tickets.length === 0"
        class="text-center py-8 border border-dashed rounded-lg"
      >
        <h3 class="mt-4 text-lg font-semibold">No matching tickets</h3>
        <p class="text-muted-foreground mt-2">
          No tickets match your search for "{{ searchQuery }}".
        </p>
        <Button @click="clearSearch" variant="outline" size="sm" class="mt-4">
          Clear Search
        </Button>
      </div>

      <!-- Tickets table using Shadcn components -->
      <div v-else>
        <Card>
          <CardContent class="px-0 overflow-x-auto">
            <div class="min-w-[650px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket #</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Comments</TableHead>
                    <TableHead class="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow
                    v-for="ticket in tickets"
                    :key="ticket.id"
                    class="cursor-pointer hover:bg-muted/50"
                    @click="viewTicket(ticket.id)"
                  >
                    <TableCell class="font-medium">
                      {{ ticket.ticketNumber || "N/A" }}
                    </TableCell>
                    <TableCell>
                      {{ ticket.subject }}
                    </TableCell>
                    <TableCell>
                      <div>{{ ticket.client?.name || "Unknown" }}</div>
                      <div class="text-sm text-muted-foreground">
                        {{ ticket.client?.email }}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        class="text-sm font-medium"
                        :class="getStatusColor(ticket.status)"
                      >
                        {{ ticket.status }}
                      </span>
                    </TableCell>
                    <TableCell>{{ formatDate(ticket.createdAt) }}</TableCell>
                    <TableCell>{{ ticket._count?.comments || 0 }}</TableCell>
                    <TableCell class="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        @click.stop="viewTicket(ticket.id)"
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    <!-- Loading state -->
    <div v-else-if="loading" class="text-center py-8">
      <Loader2 class="h-8 w-8 animate-spin mx-auto" />
      <p class="mt-2 text-muted-foreground">Loading...</p>
    </div>
    <!-- Unauthorized state -->
    <div v-else>
      <p>Access Denied. Redirecting...</p>
    </div>
  </div>
</template>

<style scoped>
/* No longer need custom table styles as we're using Shadcn components */
</style>

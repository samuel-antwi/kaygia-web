<script setup lang="ts">
import { ref, computed } from "vue";
import { AlertTriangle, Loader2 } from "lucide-vue-next";
import { Role } from "../../../types/role"; // Import local Role enum
import type { InferSelectModel } from "drizzle-orm";
import type { supportTickets, users } from "~/server/db/schema";

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

// Fetch tickets data
const { data, pending, error, refresh } = await useFetch<ApiResponse>(
  "/api/admin/tickets",
  {
    lazy: false, // Fetch data before navigating
    server: true, // Ensure it runs server-side initially
  }
);

// Computed property for easier access to the tickets array
const tickets = computed(() => data.value?.tickets || []);

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
</script>

<template>
  <div>
    <!-- Only show content if user is loaded and confirmed ADMIN -->
    <div v-if="!loading && user && user.role === Role.ADMIN">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-semibold">Support Tickets</h1>
      </div>

      <!-- Loading state -->
      <div v-if="pending" class="text-center py-8">
        <Loader2 class="h-8 w-8 animate-spin mx-auto" />
        <p class="mt-2 text-gray-600 dark:text-gray-400">Loading tickets...</p>
      </div>

      <!-- Error state -->
      <div
        v-else-if="error"
        class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6"
      >
        <div class="flex items-center space-x-2 text-red-600 dark:text-red-400">
          <AlertTriangle class="h-5 w-5" />
          <p class="font-medium">Error loading tickets</p>
        </div>
        <p class="mt-1 text-red-500 dark:text-red-300">
          {{ error.message }}
        </p>
      </div>

      <!-- Tickets table -->
      <div v-else class="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div class="overflow-x-auto">
          <table
            class="min-w-full divide-y divide-gray-200 dark:divide-gray-700"
          >
            <thead class="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th
                  scope="col"
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Subject
                </th>
                <th
                  scope="col"
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Client
                </th>
                <th
                  scope="col"
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Created
                </th>
                <th
                  scope="col"
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Comments
                </th>
                <th scope="col" class="relative px-6 py-3">
                  <span class="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr
                v-for="ticket in tickets"
                :key="ticket.id"
                class="hover:bg-gray-50 dark:hover:bg-gray-900/50"
              >
                <td class="px-6 py-4">
                  <div
                    class="text-sm font-medium text-gray-900 dark:text-gray-100"
                  >
                    {{ ticket.subject }}
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-900 dark:text-gray-100">
                    {{ ticket.client?.name || "Unknown" }}
                  </div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">
                    {{ ticket.client?.email }}
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span
                    class="text-sm font-medium"
                    :class="getStatusColor(ticket.status)"
                  >
                    {{ ticket.status }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {{ formatDate(ticket.createdAt) }}
                </td>
                <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {{ ticket._count?.comments || 0 }}
                </td>
                <td class="px-6 py-4 text-right text-sm font-medium">
                  <NuxtLink
                    :to="`/admin/tickets/${ticket.id}`"
                    class="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                  >
                    View
                  </NuxtLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <!-- Loading state -->
    <div v-else-if="loading" class="text-center py-8">
      <Loader2 class="h-8 w-8 animate-spin mx-auto" />
      <p class="mt-2 text-gray-600 dark:text-gray-400">Loading...</p>
    </div>
    <!-- Unauthorized state -->
    <div v-else>
      <p>Access Denied. Redirecting...</p>
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

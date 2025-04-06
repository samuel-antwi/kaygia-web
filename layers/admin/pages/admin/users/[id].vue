<script setup lang="ts">
import { computed } from "vue";
import { AlertTriangle, ArrowLeft, Loader2 } from "lucide-vue-next";

// Import the user components
import UserProfile from "../../../components/users/UserProfile.vue";
import RoleManagement from "../../../components/users/RoleManagement.vue";
import PasswordManagement from "../../../components/users/PasswordManagement.vue";
import AccountStatusManagement from "../../../components/users/AccountStatusManagement.vue";
import EmailVerificationManagement from "../../../components/users/EmailVerificationManagement.vue";
import UserStats from "../../../components/users/UserStats.vue";
import RecentItems from "../../../components/users/RecentItems.vue";

definePageMeta({
  layout: "admin",
});

// Define the structure for the user stats
interface UserStats {
  totalTickets: number;
  totalProjects: number;
  ticketsByStatus: Record<string, number>;
  projectsByStatus: Record<string, number>;
}

// Define the structure for a user with stats
interface UserWithStats {
  id: string;
  name: string | null;
  email: string;
  role: string;
  emailVerified: boolean;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoggedIn: Date | null;
  company: string | null;
  stats: UserStats;
  recentTickets?: any[];
  recentProjects?: any[];
}

// Define the API response structure
interface ApiResponse {
  success: boolean;
  user?: UserWithStats;
  message?: string;
}

// Define the current admin user structure
interface CurrentUser {
  id: string;
  role: string;
}

const route = useRoute();
const userId = computed(() => route.params.id as string);

// Fetch the user data
const { data, pending, error, refresh } = await useFetch<ApiResponse>(
  () => `/api/admin/users/${userId.value}`,
  {
    lazy: false,
    server: true,
    watch: [userId],
  }
);

// Get current user session (admin)
const { data: sessionData } = await useFetch<{ user: CurrentUser }>(
  "/api/user/profile"
);
const currentUser = computed(
  () => sessionData.value?.user || { id: "", role: "ADMIN" }
);

// Computed property for easier access to the user data
const user = computed(() => data.value?.user);
</script>

<template>
  <div class="container py-6 space-y-6">
    <!-- Back Button -->
    <NuxtLink
      to="/admin/users"
      class="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
    >
      <ArrowLeft class="w-4 h-4 mr-1" />
      Back to Users
    </NuxtLink>

    <!-- Loading State -->
    <div v-if="pending" class="flex items-center justify-center py-20">
      <Loader2 class="h-10 w-10 animate-spin text-muted-foreground" />
      <p class="ml-3 text-muted-foreground">Loading user details...</p>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="p-6 bg-destructive/10 border border-destructive/20 rounded-md"
    >
      <div class="flex items-center">
        <AlertTriangle class="h-6 w-6 text-destructive mr-3" />
        <div>
          <p class="text-destructive font-semibold">Error Loading User</p>
          <p class="text-destructive/90 mt-1 text-sm">
            {{
              error?.data?.statusMessage ||
              error?.data?.message ||
              error?.message ||
              "Could not load user data."
            }}
          </p>
        </div>
      </div>
      <Button @click="refresh" variant="outline" size="sm" class="mt-4">
        Retry
      </Button>
    </div>

    <!-- No User Data State -->
    <div
      v-else-if="!user"
      class="text-center py-10 border border-dashed rounded-md"
    >
      <p class="text-muted-foreground">
        User data could not be loaded or does not exist.
      </p>
      <Button @click="refresh" variant="outline" size="sm" class="mt-3">
        Retry
      </Button>
    </div>

    <!-- User Data Loaded State -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left Column: User Profile, Role Management, Password Management, Account Status -->
      <div class="lg:col-span-1 space-y-4">
        <!-- User Profile Component -->
        <UserProfile :user="user" @refresh="refresh" />

        <!-- Role Management Component -->
        <RoleManagement
          :user="user"
          :current-user="currentUser"
          :on-role-changed="refresh"
        />

        <!-- Password Management Component -->
        <PasswordManagement :user="user" />

        <!-- Account Status Management Component -->
        <AccountStatusManagement :user="user" :on-status-changed="refresh" />

        <!-- Email Verification Management Component -->
        <EmailVerificationManagement
          :user="user"
          :on-verification-changed="refresh"
        />
      </div>

      <!-- Right Column: Stats and Recent Items -->
      <div class="lg:col-span-2 space-y-4">
        <!-- User Stats Component -->
        <UserStats :stats="user.stats" />

        <!-- Recent Tickets Component -->
        <RecentItems
          v-if="user.recentTickets && user.recentTickets.length > 0"
          title="Recent Tickets"
          :items="user.recentTickets"
          item-type="tickets"
          view-all-link="/admin/tickets"
        />

        <!-- Recent Projects Component -->
        <RecentItems
          v-if="user.recentProjects && user.recentProjects.length > 0"
          title="Recent Projects"
          :items="user.recentProjects"
          item-type="projects"
          view-all-link="/admin/projects"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { AlertTriangle, Loader2, Search, UserCog, UserX } from "lucide-vue-next";
import type { InferSelectModel } from "drizzle-orm";
import type { users as usersSchema } from "~/server/db/schema";
import { useToast } from "@/components/ui/toast/use-toast";
import { UserPlus } from "lucide-vue-next";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { hasAdminAccess, isSuperAdmin } from "~/layers/admin/utils/adminAccess";

definePageMeta({
  layout: "admin",
});

// Define the user type
interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  role: string;
  company: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoggedIn: Date | null;
  active: boolean;
}

// Define the expected API response structure
interface ApiResponse {
  success: boolean;
  users?: AdminUser[];
  count?: number;
  message?: string; // Optional error message
}

const searchQuery = ref("");
const { toast } = useToast();

// Get current user to check if they're super admin
const { user: currentUser } = useAuth();

// Fetch users data
const { data, pending, error, refresh } = await useFetch<ApiResponse>(
  "/api/admin/users",
  {
    lazy: false, // Fetch data before navigating
    server: true, // Ensure it runs server-side initially
  }
);

// Computed property for easier access to the users array
const users = computed(() => data.value?.users || []);

// Filtered users based on search query
const filteredUsers = computed(() => {
  if (!searchQuery.value.trim()) return users.value;

  const query = searchQuery.value.toLowerCase();
  return users.value.filter(
    (user) =>
      (user.name?.toLowerCase() || "").includes(query) ||
      user.email.toLowerCase().includes(query) ||
      (user.company?.toLowerCase() || "").includes(query) ||
      user.role.toLowerCase().includes(query)
  );
});

// Function to format date
const formatDate = (date: string | Date) => {
  if (!date) return "N/A";
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Function to get role badge class
const getRoleBadgeClass = (role: string) => {
  return hasAdminAccess(role)
    ? "bg-primary/10 text-primary border-primary/20"
    : "bg-muted text-muted-foreground border-muted-foreground/20";
};

// Function to navigate to user detail page
const viewUser = (userId: string) => {
  navigateTo(`/admin/users/${userId}`);
};
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">User Management</h1>
        <p class="text-muted-foreground">
          View and manage all users in the system
        </p>
      </div>
    </div>

    <!-- Search and filters -->
    <div class="flex flex-wrap gap-3 items-center">
      <div class="relative flex-1 min-w-[200px]">
        <Search
          class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
        />
        <Input
          v-model="searchQuery"
          placeholder="Search users..."
          class="pl-8 h-10"
        />
      </div>
      <Button @click="refresh" variant="outline" size="sm" class="h-10">
        <span v-if="pending">
          <Loader2 class="mr-2 h-4 w-4 animate-spin" />
          Refreshing
        </span>
        <span v-else>Refresh</span>
      </Button>
      <NuxtLink v-if="currentUser && isSuperAdmin(currentUser.role)" to="/admin/users/deleted">
        <Button variant="outline">
          <UserX class="h-4 w-4 mr-2" />
          Deleted Users
        </Button>
      </NuxtLink>
      <NuxtLink to="/admin/users/create">
        <Button>
          <UserPlus class="h-4 w-4 mr-2" />
          Add User
        </Button>
      </NuxtLink>
    </div>

    <!-- Loading State -->
    <div v-if="pending" class="flex items-center justify-center py-8">
      <Loader2 class="h-8 w-8 animate-spin text-muted-foreground" />
      <p class="ml-3 text-muted-foreground">Loading users...</p>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="p-6 bg-destructive/10 border border-destructive/20 rounded-lg"
    >
      <div class="flex items-center">
        <AlertTriangle class="h-6 w-6 text-destructive mr-3" />
        <div>
          <p class="font-semibold text-destructive">Error Loading Users</p>
          <p class="text-destructive/90 mt-1 text-sm">
            {{
              error?.data?.statusMessage ||
              error?.data?.message ||
              error?.message ||
              "Could not load users data."
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

    <!-- No Results State -->
    <div
      v-else-if="filteredUsers.length === 0 && searchQuery"
      class="text-center py-8 border border-dashed rounded-lg"
    >
      <UserCog class="mx-auto h-12 w-12 text-muted-foreground/50" />
      <h3 class="mt-4 text-lg font-semibold">No users found</h3>
      <p class="text-muted-foreground mt-2">
        No users match your search criteria
      </p>
      <Button
        @click="searchQuery = ''"
        variant="outline"
        size="sm"
        class="mt-4"
      >
        Clear search
      </Button>
    </div>

    <!-- No Users State -->
    <div
      v-else-if="users.length === 0"
      class="text-center py-8 border border-dashed rounded-lg"
    >
      <UserCog class="mx-auto h-12 w-12 text-muted-foreground/50" />
      <h3 class="mt-4 text-lg font-semibold">No users available</h3>
      <p class="text-muted-foreground mt-2">
        There are no users in the system.
      </p>
    </div>

    <!-- Users List Table -->
    <div v-else>
      <Card>
        <CardContent class="px-0 overflow-x-auto">
          <div class="min-w-[650px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead class="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow
                  v-for="user in filteredUsers"
                  :key="user.id"
                  class="cursor-pointer hover:bg-muted/50"
                  @click="viewUser(user.id)"
                >
                  <TableCell class="font-medium">
                    {{ user.name || "Unnamed User" }}
                  </TableCell>
                  <TableCell>{{ user.email }}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      :class="getRoleBadgeClass(user.role)"
                    >
                      {{ user.role }}
                    </Badge>
                  </TableCell>
                  <TableCell>{{ formatDate(user.createdAt) }}</TableCell>
                  <TableCell>
                    <Badge
                      :variant="user.emailVerified ? 'default' : 'outline'"
                      :class="
                        user.emailVerified
                          ? 'bg-green-100 text-green-800 hover:bg-green-100'
                          : 'bg-orange-100 text-orange-800 hover:bg-orange-100'
                      "
                    >
                      {{ user.emailVerified ? "Verified" : "Unverified" }}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      :variant="user.active ? 'default' : 'outline'"
                      :class="
                        user.active
                          ? 'bg-green-100 text-green-800 hover:bg-green-100'
                          : 'bg-red-100 text-red-800 hover:bg-red-100'
                      "
                    >
                      {{ user.active ? "Active" : "Inactive" }}
                    </Badge>
                  </TableCell>
                  <TableCell class="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      @click.stop="viewUser(user.id)"
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
</template>

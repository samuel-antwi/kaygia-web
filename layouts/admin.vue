<script setup lang="ts">
import { ref } from "vue";
import {
  LogOut,
  User,
  Settings,
  LayoutDashboard,
  MessageSquare,
  Users,
} from "lucide-vue-next";
// Note: Assuming Button, Avatar, DropdownMenu etc. are globally available via shadcn-vue auto-imports

// Get auth composable
const { user, signOut } = useAuth();

// Handle logout
async function handleLogout() {
  console.log("[Admin Layout] Logging out...");
  await signOut();
  // Redirect to login after sign out
  await navigateTo("/auth/login");
}

// Define admin navigation items
// TODO: Adjust paths once admin pages are created
const adminNavItems = [
  { name: "Admin Dashboard", icon: LayoutDashboard, path: "/admin" },
  { name: "Manage Tickets", icon: MessageSquare, path: "/admin/tickets" },
  { name: "Manage Users", icon: Users, path: "/admin/users" },
  // Add other admin sections as needed
];

// Function to check if a route is active (simple version for admin)
function isAdminRouteActive(path: string): boolean {
  const currentPath = useRoute().path;
  return (
    currentPath === path || (path !== "/admin" && currentPath.startsWith(path))
  );
}
</script>

<template>
  <div class="flex min-h-screen bg-muted/40">
    <!-- Admin Sidebar -->
    <aside
      class="fixed inset-y-0 left-0 z-10 hidden w-60 flex-col border-r bg-background sm:flex"
    >
      <!-- Sidebar Header -->
      <div class="flex h-16 items-center border-b px-4">
        <NuxtLink to="/admin" class="flex items-center gap-2 font-semibold">
          <Settings class="h-6 w-6 text-primary" />
          <span>Admin Panel</span>
        </NuxtLink>
      </div>
      <!-- Admin Navigation -->
      <nav class="flex-1 overflow-y-auto py-4">
        <ul class="space-y-1 px-2">
          <li v-for="item in adminNavItems" :key="item.path">
            <NuxtLink
              :to="item.path"
              class="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              :class="{
                'bg-muted text-primary': isAdminRouteActive(item.path),
              }"
            >
              <component :is="item.icon" class="h-4 w-4" />
              {{ item.name }}
            </NuxtLink>
          </li>
        </ul>
      </nav>
      <!-- Sidebar Footer (User Info & Logout) -->
      <div class="mt-auto border-t p-4">
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button
              variant="ghost"
              class="flex items-center gap-2 w-full justify-start"
            >
              <Avatar class="h-8 w-8">
                <AvatarFallback>
                  <User class="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div class="flex flex-col items-start">
                <span class="text-sm font-medium">{{
                  user?.name || "Admin User"
                }}</span>
                <span class="text-xs text-muted-foreground">{{
                  user?.email
                }}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" class="w-52">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>
              <!-- Add link later if profile page exists -->
              <User class="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem disabled>
              <!-- Add link later if settings page exists -->
              <Settings class="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              @click="handleLogout"
              class="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-100"
            >
              <LogOut class="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="flex flex-1 flex-col sm:pl-60">
      <!-- Header (Optional - can add a simple header here if needed) -->
      <header
        class="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-4"
      >
        <!-- Could add breadcrumbs or page title here -->
        <h1 class="text-lg font-semibold hidden sm:flex">
          {{
            adminNavItems.find((item) => isAdminRouteActive(item.path))?.name ||
            "Admin"
          }}
        </h1>
        <!-- Mobile Menu/User Button can go here if needed for small screens -->
      </header>

      <!-- Page Content -->
      <main class="flex-1 p-4 sm:px-6 sm:py-0">
        <slot />
        <!-- Where the admin page content will be rendered -->
      </main>
    </div>
  </div>
</template>

<style scoped>
/* Add any admin-specific layout styles here */
.bg-muted {
  --tw-bg-opacity: 1;
  background-color: hsl(var(--muted) / var(--tw-bg-opacity));
}
.text-primary {
  --tw-text-opacity: 1;
  color: hsl(var(--primary) / var(--tw-text-opacity));
}
.text-muted-foreground {
  --tw-text-opacity: 1;
  color: hsl(var(--muted-foreground) / var(--tw-text-opacity));
}
/* Add more specific styles if needed */
</style>

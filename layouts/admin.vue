<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import {
  LogOut,
  User,
  LayoutDashboard,
  Ticket,
  Users,
  Sun,
  Moon,
  PanelLeft,
  PanelLeftClose,
  Menu,
  MoreVertical,
  FolderKanban,
  Briefcase,
  MessageSquare,
} from "lucide-vue-next";
// Note: Assuming Button, Avatar, DropdownMenu etc. are globally available via shadcn-vue auto-imports

// Sidebar state
const isSidebarCollapsed = ref(false);
const isMobile = ref(false);

// Check screen size on mount and resize
onMounted(() => {
  checkIfMobile();
  window.addEventListener("resize", checkIfMobile);
});

onUnmounted(() => {
  window.removeEventListener("resize", checkIfMobile);
});

function checkIfMobile() {
  isMobile.value = window.innerWidth < 768; // Using 768px breakpoint like dashboard
  // Auto-collapse sidebar on mobile if needed, or set initial state
  isSidebarCollapsed.value = isMobile.value;
}

// Get auth composable
const { user, signOut } = useAuth();

// Handle logout
async function handleLogout() {
  console.log("Attempting logout..."); // Add logging
  try {
    const result = await signOut(); // Store the result
    console.log("SignOut Result:", result); // Log the result

    if (!result?.success) {
      // If signOut failed, log the error from useAuth and maybe show a notification
      console.error("Logout failed:", result?.error || "Unknown error");
      // Optionally: Add user feedback here (e.g., using a toast notification library)
      // alert(`Logout failed: ${result?.error || "Unknown error"}`); // Simple alert for now
      return; // Stop execution if logout failed
    }

    // Redirect to login only if sign out was successful
    console.log("Logout successful, navigating to login...");
    await navigateTo("/auth/login");
  } catch (error) {
    // Catch any unexpected errors during the logout process or navigation
    console.error("Error in handleLogout:", error);
    // Optionally: Add user feedback here
    // alert("An unexpected error occurred during logout.");
  }
}

// Function to toggle sidebar collapse state
function toggleSidebar() {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
}

// Define admin navigation items
// TODO: Adjust paths once admin pages are created
const adminNavItems = [
  { name: "Admin Dashboard", icon: LayoutDashboard, path: "/admin" },
  { name: "Messages", icon: MessageSquare, path: "/admin/messages" },
  { name: "Manage Tickets", icon: Ticket, path: "/admin/tickets" },
  { name: "Manage Users", icon: Users, path: "/admin/users" },
  { name: "Manage Projects", icon: FolderKanban, path: "/admin/projects" },
  { name: "Feature Tracker", icon: Briefcase, path: "/admin/features" },
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
    <!-- Mobile Overlay -->
    <div
      v-if="!isSidebarCollapsed && isMobile"
      class="fixed inset-0 bg-black/60 z-30 lg:hidden"
      @click="toggleSidebar"
    ></div>

    <!-- Admin Sidebar -->
    <aside
      class="fixed inset-y-0 left-0 z-40 flex h-full flex-col border-r bg-background transition-all duration-300 ease-in-out"
      :class="[
        isSidebarCollapsed && isMobile
          ? 'w-0 -translate-x-full'
          : isSidebarCollapsed && !isMobile
            ? 'w-[70px]'
            : !isSidebarCollapsed && isMobile
              ? 'w-60 translate-x-0'
              : 'w-60', // Default: expanded desktop
      ]"
    >
      <!-- Sidebar Header -->
      <div
        class="flex h-16 shrink-0 items-center justify-between border-b pr-4"
      >
        <NuxtLink
          to="/admin"
          class="flex items-center gap-2 font-semibold transition-opacity mr-4"
          :class="isSidebarCollapsed ? 'justify-center' : ''"
        >
          <div
            :class="
              isSidebarCollapsed
                ? 'opacity-0 w-0 h-0  overflow-hidden absolute'
                : 'opacity-100 pl-4'
            "
          >
            Admin Panel
          </div>
        </NuxtLink>
        <!-- Sidebar Toggle Button -->
        <Button
          variant="ghost"
          size="icon"
          @click="toggleSidebar"
          class="rounded-lg shrink-0"
          aria-label="Toggle sidebar"
        >
          <PanelLeftClose v-if="!isSidebarCollapsed" class="h-5 w-5" />
          <PanelLeft v-else class="h-5 w-5" />
        </Button>
      </div>
      <!-- Admin Navigation -->
      <nav class="flex-1 overflow-y-auto py-4">
        <!-- Assuming Tooltip components are globally available -->
        <TooltipProvider :delay-duration="100">
          <ul class="space-y-1 px-2">
            <li v-for="item in adminNavItems" :key="item.path">
              <Tooltip>
                <TooltipTrigger as-child>
                  <NuxtLink
                    :to="item.path"
                    class="flex items-center rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                    :class="[
                      isSidebarCollapsed ? 'justify-center' : 'gap-3',
                      {
                        'bg-muted text-primary': isAdminRouteActive(item.path),
                      },
                    ]"
                    @click="isMobile && toggleSidebar()"
                  >
                    <component :is="item.icon" class="h-4 w-4 flex-shrink-0" />
                    <!-- Hide text when collapsed -->
                    <span :class="isSidebarCollapsed ? 'sr-only' : ''">{{
                      item.name
                    }}</span>
                  </NuxtLink>
                </TooltipTrigger>
                <TooltipContent v-if="isSidebarCollapsed" side="right">
                  <p>{{ item.name }}</p>
                </TooltipContent>
              </Tooltip>
            </li>
          </ul>
        </TooltipProvider>
      </nav>
      <!-- Sidebar Footer (User Info & Logout) -->
      <div
        class="mt-auto border-t"
        :class="isSidebarCollapsed ? 'p-2' : 'p-4'"
      >
        <DropdownMenu>
          <!-- When collapsed: Avatar becomes the trigger -->
          <DropdownMenuTrigger v-if="isSidebarCollapsed" as-child>
            <Button variant="ghost" class="w-full p-1 justify-center">
              <Avatar class="h-8 w-8">
                <AvatarImage src="" alt="User avatar" />
                <AvatarFallback>
                  <User class="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>

          <!-- When expanded: Show user info and separate trigger -->
          <template v-else>
            <div class="flex items-center gap-2">
              <Avatar class="h-8 w-8">
                <AvatarImage src="" alt="User avatar" />
                <AvatarFallback>
                  <User class="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div class="flex-1">
                <p class="text-sm font-medium">{{ user?.name || "Admin User" }}</p>
                <p class="text-xs text-muted-foreground">
                  {{ user?.email || "admin@example.com" }}
                </p>
              </div>
              <DropdownMenuTrigger class="ml-auto">
                <Button variant="ghost" size="icon" class="h-8 w-8">
                  <MoreVertical class="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
            </div>
          </template>

          <!-- Dropdown Menu Content -->
          <DropdownMenuContent 
            :align="isSidebarCollapsed ? 'center' : 'end'" 
            side="top" 
            class="w-52 mb-1"
          >
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>
              <User class="mr-2 h-4 w-4" />
              <span>Profile</span>
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
    <div
      class="transition-all duration-300 ease-in-out w-full"
      :class="isSidebarCollapsed ? 'md:pl-[70px]' : 'md:pl-60'"
    >
      <!-- Header -->
      <header
        class="sticky top-0 z-20 flex h-14 items-center justify-between gap-4 border-b bg-background px-4 sm:px-6"
      >
        <!-- Left side: Title / Mobile Menu Toggle -->
        <div class="flex items-center">
          <!-- Mobile Menu Button -->
          <Button
            variant="ghost"
            size="icon"
            class="shrink-0 md:hidden mr-2"
            @click="toggleSidebar"
            aria-label="Toggle Menu"
          >
            <Menu class="h-5 w-5" />
          </Button>
          <!-- Desktop Title -->
          <h1 class="text-lg font-semibold hidden md:flex">
            {{
              adminNavItems.find((item) => isAdminRouteActive(item.path))
                ?.name || "Admin"
            }}
          </h1>
        </div>
      </header>

      <!-- Page Content -->
      <main class="p-4 sm:p-6">
        <slot />
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

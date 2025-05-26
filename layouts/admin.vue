<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
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

// Get current page title based on route
const pageTitle = computed<string>(() => {
  const currentPath = useRoute().path;
  
  // Find matching nav item
  const matchingItem = adminNavItems.find(
    (item) =>
      (item.path === "/admin" && currentPath === "/admin") ||
      (item.path !== "/admin" && currentPath.startsWith(item.path))
  );
  
  if (matchingItem) {
    return matchingItem.name;
  }
  
  // Default titles for specific paths
  if (currentPath.includes("/users/")) {
    return "User Details";
  }
  if (currentPath.includes("/projects/")) {
    return "Project Details";
  }
  if (currentPath.includes("/tickets/")) {
    return "Ticket Details";
  }
  
  return "Admin Dashboard";
});

// Dropdown items for user menu  
interface DropdownItem {
  label: string;
  icon?: any;
  action?: () => void | Promise<void>;
  href?: string;
  disabled?: boolean;
  variant?: "default" | "danger";
}

const dropdownItems = ref<DropdownItem[]>([
  {
    label: "Profile",
    icon: User,
    href: "/dashboard/profile",
  },
  {
    label: "Logout",
    icon: LogOut,
    action: handleLogout,
    variant: "danger" as const,
  },
]);
</script>

<template>
  <AppSidebar
    :nav-items="adminNavItems"
    :user-name="user?.name || 'Admin User'"
    :user-email="user?.email || 'admin@example.com'"
    :user-avatar="user?.avatarUrl || undefined"
    :dropdown-items="dropdownItems"
    brand-path="/admin"
    brand-text="Admin Panel"
    @logout="handleLogout"
  >
    <!-- Header slot -->
    <template #header="{ toggleSidebar, isMobile }">
      <header
        class="sticky top-0 z-20 flex h-14 items-center justify-between gap-4 border-b bg-background px-4 sm:px-6"
      >
        <!-- Left side: Title / Mobile Menu Toggle -->
        <div class="flex items-center">
          <!-- Mobile Menu Button -->
          <Button
            v-if="isMobile"
            variant="ghost"
            size="icon"
            class="shrink-0 md:hidden mr-2"
            @click="toggleSidebar"
            aria-label="Toggle Menu"
          >
            <Menu class="h-5 w-5" />
          </Button>
          <!-- Desktop Title -->
          <h1 class="text-lg font-semibold">
            {{ pageTitle }}
          </h1>
        </div>
      </header>
    </template>

    <!-- Main content -->
    <template #default>
      <main class="p-4 sm:p-6">
        <slot />
      </main>
    </template>
  </AppSidebar>
</template>


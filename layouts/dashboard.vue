<script setup lang="ts">
import { ref, computed } from "vue";
import {
  LayoutDashboard,
  Briefcase,
  FilePlus,
  Receipt,
  Settings,
  Ticket,
  User,
  LogOut,
  Menu,
} from "lucide-vue-next";

const route = useRoute();

// Get auth composable
const { user, signOut } = useAuth();

// Handle logout
async function handleLogout() {
  await signOut();
  navigateTo("/auth/login");
}

// Get current page title based on route
const pageTitle = computed(() => {
  const currentPath = route.path;

  // Find matching nav item
  const matchingItem = navItems.find(
    (item) =>
      (item.path === "/dashboard" && currentPath === "/dashboard") ||
      (item.path !== "/dashboard" && currentPath.startsWith(item.path))
  );

  if (matchingItem) {
    return matchingItem.name;
  }

  // Default to Dashboard or try to generate a title from the path
  if (currentPath.includes("/projects/")) {
    return "Project Details";
  }

  return "Dashboard";
});

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { name: "Projects", icon: Briefcase, path: "/dashboard/projects" },
  {
    name: "Request Project",
    icon: FilePlus,
    path: "/dashboard/projects/new",
  },
  { name: "Tickets", icon: Ticket, path: "/dashboard/tickets" },
  { name: "Invoices", icon: Receipt, path: "/dashboard/invoices" },
  { name: "Account", icon: Settings, path: "/dashboard/account" },
];

// Sidebar state
const isSidebarCollapsed = useState('dashboard.sidebarCollapsed', () => false);

// Dropdown items for user menu
const dropdownItems = ref([
  {
    label: "Profile",
    icon: User,
    href: "/dashboard/profile",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/dashboard/account",
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
    :nav-items="navItems"
    :user-name="user?.name"
    :user-email="user?.email"
    :user-avatar="user?.avatarUrl || undefined"
    :dropdown-items="dropdownItems"
    brand-path="/dashboard"
    active-item-class="bg-primary/10 text-primary"
    :show-active-indicator="true"
    @logout="handleLogout"
  >
    <!-- Brand slot -->
    <template #brand>
      <div class="flex items-center gap-2 font-bold">
        <span class="text-primary text-xl">K</span>
        <span class="text-muted-foreground">Web</span>
      </div>
    </template>

    <!-- Header slot -->
    <template #header="{ toggleSidebar, isMobile }">
      <header class="sticky top-0 z-10 border-b bg-background w-full">
        <div class="flex h-16 items-center justify-between px-4">
          <div class="flex items-center">
            <!-- Mobile menu button -->
            <Button
              v-if="isMobile"
              variant="ghost"
              size="icon"
              @click="toggleSidebar"
              class="mr-2 md:hidden"
              aria-label="Toggle sidebar"
            >
              <Menu class="h-5 w-5" />
            </Button>
            <h1 class="text-lg font-semibold">
              {{ pageTitle }}
            </h1>
          </div>

          <!-- Additional header controls can be added here if needed -->
          <div class="flex items-center space-x-2">
            <!-- Reserved for future header controls (notifications, etc.) -->
          </div>
        </div>
      </header>
    </template>

    <!-- Main content -->
    <template #default>
      <main class="p-4 md:p-6">
        <slot />
      </main>
    </template>
  </AppSidebar>
</template>

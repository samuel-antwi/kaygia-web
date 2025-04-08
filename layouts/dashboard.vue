<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import {
  LayoutDashboard,
  Briefcase,
  FilePlus,
  MessageSquare,
  Receipt,
  PanelLeftClose,
  PanelLeft,
  User,
  MoreVertical,
  LogOut,
  Bell,
  Sun,
  Moon,
  Menu,
  Ticket,
  MessagesSquare,
  UserCircle,
} from "lucide-vue-next";
import { useTicketStore } from "../layers/dashboard/stores/ticketStore";
import { storeToRefs } from "pinia";
import { useTicketUtils } from "../layers/dashboard/composables/useTicketUtils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const isSidebarCollapsed = ref(false);
const isMobile = ref(false);
const route = useRoute();

// Get auth composable
const { user, signOut, loading: authLoading } = useAuth();

// Get message utils
const { formatDate, getSenderIcon, getSenderName } = useTicketUtils();

// Check if device is mobile
onMounted(() => {
  checkIfMobile();
  window.addEventListener("resize", checkIfMobile);
});

function checkIfMobile() {
  isMobile.value = window.innerWidth < 768;
  // Auto-collapse sidebar on mobile
  isSidebarCollapsed.value = isMobile.value;
}

function toggleSidebar() {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
}

// Handle logout
async function handleLogout() {
  await signOut();
  navigateTo("/auth/login");
}

// Check if a route is active
function isActiveRoute(path: string): boolean {
  const currentPath = route.path;

  // 1. Exact match is always active
  if (path === currentPath) {
    return true;
  }

  // 2. Special case: Activate "Projects" list link when viewing a specific project detail page
  //    (path starts with /dashboard/projects/ followed by something),
  //    but explicitly exclude the "Request Project" page.
  if (
    path === "/dashboard/projects" &&
    currentPath.startsWith("/dashboard/projects/") &&
    currentPath !== "/dashboard/projects/new"
  ) {
    return true;
  }

  // 3. Special case: Activate "Tickets" list link when viewing a specific ticket detail page.
  //    (path starts with /dashboard/tickets/ followed by something)
  if (
    path === "/dashboard/tickets" &&
    currentPath.startsWith("/dashboard/tickets/")
  ) {
    return true;
  }

  // Add checks here for any *other* future nested sections if needed

  // Default: not active if none of the above conditions are met
  return false;
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
  { name: "Profile", icon: User, path: "/dashboard/profile" },
];
</script>

<template>
  <div class="flex min-h-screen antialiased bg-muted/60">
    <!-- Mobile Overlay -->
    <div
      v-if="!isSidebarCollapsed && isMobile"
      class="fixed inset-0 bg-black/50 z-10"
      @click="toggleSidebar"
    ></div>

    <!-- Sidebar -->
    <aside
      class="fixed inset-y-0 left-0 z-20 flex h-full flex-col border-r bg-background transition-all duration-300"
      :class="
        isSidebarCollapsed
          ? 'w-0 md:w-[70px] -translate-x-full md:translate-x-0'
          : 'w-[250px]'
      "
    >
      <!-- Sidebar header -->
      <div class="flex h-16 items-center border-b px-4 py-2">
        <NuxtLink
          to="/dashboard"
          class="flex items-center gap-2 font-bold transition-opacity"
          :class="isSidebarCollapsed ? 'justify-center' : ''"
        >
          <span class="text-primary text-xl">K</span>
          <span
            class="text-muted-foreground transition-opacity"
            :class="isSidebarCollapsed ? 'opacity-0 hidden' : 'opacity-100'"
          >
            Web
          </span>
        </NuxtLink>
        <Button
          variant="ghost"
          size="icon"
          @click="toggleSidebar"
          class="ml-auto"
          aria-label="Toggle sidebar"
        >
          <PanelLeftClose v-if="isSidebarCollapsed" class="h-5 w-5" />
          <PanelLeft v-else class="h-5 w-5" />
        </Button>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto py-4">
        <TooltipProvider :delay-duration="100">
          <ul class="space-y-1 px-2">
            <li v-for="item in navItems" :key="item.path">
              <Tooltip>
                <TooltipTrigger as-child>
                  <NuxtLink
                    :to="item.path"
                    class="flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors"
                    :class="[
                      isSidebarCollapsed ? 'justify-center' : 'gap-3',
                      isActiveRoute(item.path)
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-muted text-muted-foreground',
                    ]"
                    @click="isMobile && toggleSidebar()"
                  >
                    <component
                      :is="item.icon"
                      class="h-5 w-5"
                      :class="{ 'text-primary': isActiveRoute(item.path) }"
                    />
                    <span :class="isSidebarCollapsed ? 'sr-only' : ''">
                      {{ item.name }}
                    </span>
                    <div
                      v-if="isActiveRoute(item.path) && !isSidebarCollapsed"
                      class="ml-auto w-1.5 h-5 bg-primary rounded-full"
                    ></div>
                  </NuxtLink>
                </TooltipTrigger>
                <TooltipContent v-if="isSidebarCollapsed" side="right">
                  <p class="text-white">
                    {{ item.name }}
                  </p>
                </TooltipContent>
              </Tooltip>
            </li>
          </ul>
        </TooltipProvider>
      </nav>

      <!-- Sidebar footer -->
      <div class="border-t p-3">
        <div class="flex gap-2 items-center">
          <Avatar class="h-8 w-8">
            <AvatarImage src="" alt="User avatar" />
            <AvatarFallback>
              <User class="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <div :class="isSidebarCollapsed ? 'hidden' : ''">
            <p v-if="authLoading" class="text-sm font-medium">Loading...</p>
            <template v-else>
              <p class="text-sm font-medium">{{ user?.name || "User" }}</p>
              <p class="text-xs text-muted-foreground">
                {{ user?.email || "user@example.com" }}
              </p>
            </template>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger class="ml-auto">
              <Button variant="ghost" size="icon">
                <MoreVertical class="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem class="cursor-pointer">
                <User class="mr-2 h-4 w-4" />
                <NuxtLink to="/dashboard/profile">Profile</NuxtLink>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem class="cursor-pointer" @click="handleLogout">
                <LogOut class="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </aside>

    <!-- Main content -->
    <div
      class="transition-all duration-300 w-full"
      :class="[isSidebarCollapsed ? 'md:pl-[70px]' : 'md:pl-[250px]']"
    >
      <!-- Header -->
      <header class="sticky top-0 z-10 border-b bg-background w-full">
        <div class="flex h-16 items-center justify-between px-4">
          <div class="flex items-center">
            <!-- Mobile menu button -->
            <Button
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

          <div class="flex items-center space-x-2">
            <!-- User profile dropdown -->
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button variant="ghost" class="relative h-8 w-8 rounded-full">
                  <Avatar class="h-8 w-8">
                    <AvatarFallback>
                      <User v-if="!authLoading" class="h-4 w-4" />
                      <div
                        v-else
                        class="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"
                      ></div>
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div v-if="!authLoading">
                    {{ user?.name || "My Account" }}
                  </div>
                  <div v-else>Loading...</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem class="cursor-pointer">
                  <User class="mr-2 h-4 w-4" />
                  <NuxtLink to="/dashboard/profile">Profile</NuxtLink>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem class="cursor-pointer" @click="handleLogout">
                  <LogOut class="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <!-- Page content -->
      <main class="p-4 md:p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

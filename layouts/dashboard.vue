<script setup lang="ts">
import { ref, onMounted, computed, watchEffect } from "vue";
import {
  LayoutDashboard,
  Briefcase,
  FilePlus,
  MessageSquare,
  Receipt,
  Settings,
  PanelLeftClose,
  PanelLeft,
  User,
  MoreVertical,
  LogOut,
  Bell,
  Sun,
  Moon,
  Menu,
  MessagesSquare,
  UserCircle,
} from "lucide-vue-next";
import { useMessageStore } from "../layers/dashboard/stores/messageStore";
import { storeToRefs } from "pinia";
import { useMessageUtils } from "../layers/dashboard/composables/useMessageUtils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const colorMode = useColorMode();
const isSidebarCollapsed = ref(false);
const isMobile = ref(false);
const route = useRoute();

// Get auth composable
const { user, signOut, loading: authLoading } = useAuth();

// Get message store
const messageStore = useMessageStore();
const { unreadCount, sortedMessages } = storeToRefs(messageStore);

// Get message utils
const { formatDate, getSenderIcon, getSenderName } = useMessageUtils();

// Log unread count for debugging
watchEffect(() => {
  console.log("Layout unreadCount:", unreadCount.value);
});

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

function toggleColorMode() {
  colorMode.preference = colorMode.value === "dark" ? "light" : "dark";
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

  // Special case for "Request Project" page
  if (
    path === "/dashboard/projects/new" &&
    currentPath === "/dashboard/projects/new"
  ) {
    return true;
  }

  // Exact match for dashboard home
  if (path === "/dashboard" && currentPath === "/dashboard") {
    return true;
  }

  // For other routes, check if current route starts with the path (for nested routes)
  // but exclude the special case of /projects/new when checking /projects
  if (
    path === "/dashboard/projects" &&
    currentPath === "/dashboard/projects/new"
  ) {
    return false;
  }

  return path !== "/dashboard" && currentPath.startsWith(path);
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
  { name: "Messages", icon: MessageSquare, path: "/dashboard/messages" },
  { name: "Invoices", icon: Receipt, path: "/dashboard/invoices" },
  { name: "Settings", icon: Settings, path: "/dashboard/settings" },
];

// Navigate to messages page
const goToMessages = () => {
  navigateTo("/dashboard/messages");
};
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
            <p class="text-sm font-medium">{{ user?.name || "User" }}</p>
            <p class="text-xs text-muted-foreground">
              {{ user?.email || "user@example.com" }}
            </p>
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
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem class="cursor-pointer">
                <Settings class="mr-2 h-4 w-4" />
                <span>Settings</span>
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
            <!-- Notifications -->
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button
                  variant="ghost"
                  size="icon"
                  class="relative rounded-full"
                >
                  <Bell class="h-5 w-5" />
                  <Badge
                    v-if="unreadCount > 0"
                    variant="destructive"
                    class="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs"
                  >
                    {{ unreadCount }}
                  </Badge>
                  <span class="sr-only">Notifications</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" class="w-[300px]">
                <DropdownMenuLabel>Recent Messages</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div
                  v-if="sortedMessages.length > 0"
                  class="max-h-[300px] overflow-y-auto"
                >
                  <DropdownMenuItem
                    v-for="message in sortedMessages.slice(0, 5)"
                    :key="message.id"
                    class="cursor-pointer flex items-start gap-3 p-3"
                    @click="goToMessages"
                  >
                    <div
                      class="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0"
                      :class="{
                        'bg-secondary/20': message.sender === 'CLIENT',
                      }"
                    >
                      <component
                        :is="getSenderIcon(message.sender)"
                        class="h-4 w-4"
                        :class="
                          message.sender === 'ADMIN'
                            ? 'text-primary'
                            : 'text-secondary'
                        "
                      />
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium truncate">
                        {{ message.subject }}
                      </p>
                      <p class="text-xs text-muted-foreground truncate">
                        {{ message.content }}
                      </p>
                      <p class="text-xs text-muted-foreground mt-1">
                        {{ getSenderName(message.sender) }} -
                        {{ formatDate(message.createdAt) }}
                      </p>
                    </div>
                    <div
                      v-if="!message.isRead"
                      class="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1"
                      title="Unread"
                    ></div>
                  </DropdownMenuItem>
                </div>
                <div
                  v-else
                  class="p-4 text-center text-sm text-muted-foreground"
                >
                  No recent messages.
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  class="cursor-pointer justify-center"
                  @click="goToMessages"
                >
                  View All Messages
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <!-- Color mode toggle -->
            <Button
              variant="ghost"
              size="icon"
              @click="toggleColorMode"
              aria-label="Toggle theme"
            >
              <Sun v-show="colorMode.value === 'dark'" class="h-5 w-5" />
              <Moon v-show="colorMode.value === 'light'" class="h-5 w-5" />
            </Button>

            <!-- User dropdown -->
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Avatar class="h-8 w-8">
                  <AvatarImage src="" alt="User avatar" />
                  <AvatarFallback>
                    <User class="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem class="cursor-pointer">
                  <User class="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem class="cursor-pointer">
                  <Settings class="mr-2 h-4 w-4" />
                  <span>Settings</span>
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

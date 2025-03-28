<script setup lang="ts">
import { ref, onMounted } from "vue";
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
} from "lucide-vue-next";

const colorMode = useColorMode();
const isSidebarCollapsed = ref(false);
const isMobile = ref(false);

// Get auth composable
const { user, signOut, loading } = useAuth();

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

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { name: "Projects", icon: Briefcase, path: "/dashboard/projects" },
  {
    name: "Request Project",
    icon: FilePlus,
    path: "/dashboard/request-project",
  },
  { name: "Messages", icon: MessageSquare, path: "/dashboard/messages" },
  { name: "Invoices", icon: Receipt, path: "/dashboard/invoices" },
  { name: "Settings", icon: Settings, path: "/dashboard/settings" },
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
        <ul class="space-y-1 px-2">
          <li v-for="item in navItems" :key="item.path">
            <NuxtLink
              :to="item.path"
              class="flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
              :class="isSidebarCollapsed ? 'justify-center' : 'gap-3'"
              @click="isMobile && toggleSidebar()"
            >
              <component :is="item.icon" class="h-5 w-5" />
              <span :class="isSidebarCollapsed ? 'sr-only' : ''">
                {{ item.name }}
              </span>
            </NuxtLink>
          </li>
        </ul>
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
            <h1 class="text-lg font-medium">Dashboard</h1>
          </div>

          <div class="flex items-center gap-4">
            <!-- Notifications -->
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="ghost" size="icon" class="relative">
                  <Bell class="h-5 w-5" />
                  <span
                    class="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center"
                  >
                    3
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[300px]">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div class="max-h-[300px] overflow-y-auto">
                  <div
                    v-for="i in 3"
                    :key="i"
                    class="flex gap-3 p-3 hover:bg-muted/50"
                  >
                    <Avatar class="h-8 w-8">
                      <AvatarImage src="" alt="" />
                      <AvatarFallback>
                        <Bell class="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p class="text-sm font-medium">Project Update</p>
                      <p class="text-xs text-muted-foreground">
                        Your project has been updated
                      </p>
                      <p class="text-xs text-muted-foreground">2 hours ago</p>
                    </div>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem class="cursor-pointer justify-center">
                  View all notifications
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
              <Sun v-if="colorMode.value === 'dark'" class="h-5 w-5" />
              <Moon v-else class="h-5 w-5" />
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
      <main class="px-4 py-6 overflow-x-hidden">
        <slot />
      </main>
    </div>
  </div>
</template>

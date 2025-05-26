<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import {
  PanelLeft,
  PanelLeftClose,
  MoreVertical,
  User,
  LogOut,
} from "lucide-vue-next";
import type { Component } from "vue";

interface NavItem {
  name: string;
  icon: Component;
  path: string;
}

interface DropdownItem {
  label: string;
  icon?: Component;
  action?: () => void | Promise<void>;
  href?: string;
  disabled?: boolean;
  variant?: "default" | "danger";
}

interface Props {
  // Navigation
  navItems: NavItem[];

  // Branding
  brandText?: string;
  brandPath?: string;

  // User info
  userName?: string;
  userEmail?: string;
  userAvatar?: string;

  // Dropdown menu
  dropdownItems?: DropdownItem[];

  // Styling
  activeItemClass?: string;
  showActiveIndicator?: boolean;

  // Behavior
  defaultCollapsed?: boolean;
  autoCollapseOnMobile?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  brandText: "Dashboard",
  brandPath: "/",
  activeItemClass: "bg-muted text-primary",
  showActiveIndicator: false,
  defaultCollapsed: false,
  autoCollapseOnMobile: true,
  dropdownItems: () => [],
});

const emit = defineEmits<{
  toggle: [collapsed: boolean];
  logout: [];
  "dropdown-action": [item: DropdownItem];
}>();

// State
const isSidebarCollapsed = ref(props.defaultCollapsed);
const isMobile = ref(false);

// Check screen size
const checkIfMobile = () => {
  isMobile.value = window.innerWidth < 768;
  if (
    props.autoCollapseOnMobile &&
    isMobile.value &&
    !isSidebarCollapsed.value
  ) {
    isSidebarCollapsed.value = true;
  }
};

onMounted(() => {
  checkIfMobile();
  window.addEventListener("resize", checkIfMobile);
});

onUnmounted(() => {
  window.removeEventListener("resize", checkIfMobile);
});

// Toggle sidebar
const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
  emit("toggle", isSidebarCollapsed.value);
};

// Check if route is active - finds the most specific match
const isRouteActive = (path: string): boolean => {
  const currentPath = useRoute().path;

  // Exact match
  if (currentPath === path) {
    return true;
  }

  // For non-exact matches, find the longest matching path among all nav items
  const allPaths = props.navItems.map((item) => item.path);
  const matchingPaths = allPaths.filter(
    (itemPath) => currentPath.startsWith(itemPath) && itemPath !== "/"
  );

  // Sort by length (longest first) to find the most specific match
  matchingPaths.sort((a, b) => b.length - a.length);

  // Only highlight if this path is the most specific match
  return matchingPaths.length > 0 && matchingPaths[0] === path;
};

// Handle dropdown item click
const handleDropdownItemClick = async (item: DropdownItem) => {
  if (item.disabled) return;

  if (item.action) {
    await item.action();
  }

  emit("dropdown-action", item);

  if (item.label.toLowerCase().includes("logout")) {
    emit("logout");
  }
};

// Computed classes
const sidebarClasses = computed(() => {
  if (isSidebarCollapsed.value && isMobile.value) {
    return "w-0 -translate-x-full";
  } else if (isSidebarCollapsed.value && !isMobile.value) {
    return "w-[70px]";
  } else if (!isSidebarCollapsed.value && isMobile.value) {
    return "w-[250px] translate-x-0";
  } else {
    return "w-[250px]";
  }
});

const mainContentPadding = computed(() => {
  return isSidebarCollapsed.value ? "md:pl-[70px]" : "md:pl-[250px]";
});
</script>

<template>
  <div class="flex min-h-screen bg-muted/40">
    <!-- Mobile Overlay -->
    <div
      v-if="!isSidebarCollapsed && isMobile"
      class="fixed inset-0 bg-black/60 z-30 lg:hidden"
      @click="toggleSidebar"
    ></div>

    <!-- Sidebar -->
    <aside
      class="fixed inset-y-0 left-0 z-40 flex h-full flex-col border-r bg-background transition-all duration-300 ease-in-out"
      :class="sidebarClasses"
    >
      <!-- Sidebar Header -->
      <div
        class="flex h-16 shrink-0 items-center border-b px-4"
        :class="isSidebarCollapsed ? 'justify-center' : 'justify-between'"
      >
        <NuxtLink
          v-if="!isSidebarCollapsed"
          :to="brandPath"
          class="flex items-center gap-2 font-semibold"
        >
          <slot name="brand">
            {{ brandText }}
          </slot>
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

      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto py-4">
        <TooltipProvider :delay-duration="100">
          <ul class="space-y-1 px-2">
            <li v-for="item in navItems" :key="item.path">
              <Tooltip>
                <TooltipTrigger as-child>
                  <NuxtLink
                    :to="item.path"
                    class="relative flex items-center rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                    :class="[
                      isSidebarCollapsed ? 'justify-center' : 'gap-3',
                      isRouteActive(item.path) ? activeItemClass : '',
                    ]"
                    @click="isMobile && toggleSidebar()"
                  >
                    <!-- Active Indicator -->
                    <div
                      v-if="showActiveIndicator && isRouteActive(item.path)"
                      class="absolute left-0 h-8 w-1 rounded-r-md bg-primary"
                    ></div>

                    <component :is="item.icon" class="h-4 w-4 flex-shrink-0" />
                    <span :class="isSidebarCollapsed ? 'sr-only' : ''">
                      {{ item.name }}
                    </span>
                  </NuxtLink>
                </TooltipTrigger>
                <TooltipContent v-if="isSidebarCollapsed" side="right">
                  <p>{{ item.name }}</p>
                </TooltipContent>
              </Tooltip>
            </li>
          </ul>
        </TooltipProvider>

        <!-- Slot for additional nav content -->
        <slot name="nav-after" :collapsed="isSidebarCollapsed" />
      </nav>

      <!-- Sidebar Footer (User Info & Logout) -->
      <div class="mt-auto border-t" :class="isSidebarCollapsed ? 'p-2' : 'p-4'">
        <slot name="footer" :collapsed="isSidebarCollapsed">
          <DropdownMenu>
            <!-- When collapsed: Avatar becomes the trigger -->
            <DropdownMenuTrigger v-if="isSidebarCollapsed" as-child>
              <Button variant="ghost" class="w-full p-1 justify-center">
                <Avatar class="h-8 w-8">
                  <AvatarImage
                    v-if="userAvatar"
                    :src="userAvatar"
                    alt="User avatar"
                  />
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
                  <AvatarImage
                    v-if="userAvatar"
                    :src="userAvatar"
                    alt="User avatar"
                  />
                  <AvatarFallback>
                    <User class="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div class="flex-1">
                  <p class="text-sm font-medium">{{ userName || "User" }}</p>
                  <p class="text-xs text-muted-foreground">
                    {{ userEmail || "user@example.com" }}
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
              <slot name="dropdown-content">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />

                <template v-for="item in dropdownItems" :key="item.label">
                  <DropdownMenuItem
                    :disabled="item.disabled"
                    @click="() => handleDropdownItemClick(item)"
                    :class="{
                      'cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-100':
                        item.variant === 'danger',
                    }"
                  >
                    <template v-if="item.href">
                      <NuxtLink
                        :to="item.href"
                        class="flex items-center w-full"
                      >
                        <component
                          v-if="item.icon"
                          :is="item.icon"
                          class="mr-2 h-4 w-4"
                        />
                        <span>{{ item.label }}</span>
                      </NuxtLink>
                    </template>
                    <template v-else>
                      <component
                        v-if="item.icon"
                        :is="item.icon"
                        class="mr-2 h-4 w-4"
                      />
                      <span>{{ item.label }}</span>
                    </template>
                  </DropdownMenuItem>
                </template>

                <!-- Default logout if no items provided -->
                <template v-if="dropdownItems.length === 0">
                  <DropdownMenuItem
                    @click="$emit('logout')"
                    class="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-100"
                  >
                    <LogOut class="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </template>
              </slot>
            </DropdownMenuContent>
          </DropdownMenu>
        </slot>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div
      class="transition-all duration-300 ease-in-out w-full"
      :class="mainContentPadding"
    >
      <slot
        name="header"
        :collapsed="isSidebarCollapsed"
        :toggle-sidebar="toggleSidebar"
        :is-mobile="isMobile"
      />

      <slot />
    </div>
  </div>
</template>

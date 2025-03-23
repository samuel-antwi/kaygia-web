<script setup lang="ts">
import { ref } from "vue";
import {
  Menu,
  X,
  Home,
  Settings,
  Users,
  Briefcase,
  Mail,
  LogIn,
} from "lucide-vue-next";
import type { FunctionalComponent } from "vue";
import type { LucideProps } from "lucide-vue-next";

const { $site } = useNuxtApp();
const isOpen = ref(false);

function toggleMenu() {
  isOpen.value = !isOpen.value;
}

function closeMenu() {
  isOpen.value = false;
}

// Map icons to nav items with proper typing
type IconName = "Home" | "Services" | "About" | "Portfolio" | "Contact";
type IconMap = Record<IconName, FunctionalComponent<LucideProps>>;

const navIcons: IconMap = {
  Home: Home,
  Services: Settings,
  About: Users,
  Portfolio: Briefcase,
  Contact: Mail,
};

// Helper function to get icon by name, with fallback
function getNavIcon(name: string): FunctionalComponent<LucideProps> {
  return navIcons[name as IconName] || Home;
}
</script>

<template>
  <div class="md:hidden">
    <!-- Mobile menu button -->
    <Button variant="ghost" size="icon" @click="toggleMenu" aria-label="Menu">
      <Menu class="h-5 w-5" />
    </Button>

    <!-- Mobile menu drawer -->
    <Drawer v-model:open="isOpen" direction="right">
      <DrawerContent class="w-[250px] sm:w-[300px]">
        <DrawerHeader>
          <DrawerTitle class="flex items-center gap-2">
            <span class="text-primary text-xl">{{ $site.name }}</span>
            <span class="text-muted-foreground">{{ $site.nameSuffix }}</span>
          </DrawerTitle>
          <Button
            variant="ghost"
            size="icon"
            @click="closeMenu"
            class="absolute right-4 top-4"
          >
            <X class="h-4 w-4" />
          </Button>
        </DrawerHeader>

        <div class="px-6 py-2">
          <nav class="flex flex-col space-y-4">
            <NuxtLink
              v-for="item in $site.navigation.main"
              :key="item.name"
              :to="item.href"
              @click="closeMenu"
              class="flex items-center gap-2 py-2 text-sm font-medium hover:text-primary"
            >
              <component :is="getNavIcon(item.name)" class="h-4 w-4" />
              {{ item.name }}
            </NuxtLink>
            <Separator />
            <NuxtLink
              to="/login"
              @click="closeMenu"
              class="flex items-center gap-2 py-2 text-sm font-medium hover:text-primary"
            >
              <LogIn class="h-4 w-4" />
              Client Login
            </NuxtLink>
          </nav>
        </div>
      </DrawerContent>
    </Drawer>
  </div>
</template>

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
import site from "~/utils/config/site";

const mobileMenuOpen = ref(false);

function toggleMobileMenu() {
  mobileMenuOpen.value = !mobileMenuOpen.value;
}

// Use the imported site as fallback if $site is not available
const { $site = site } = useNuxtApp();

function closeMenu() {
  mobileMenuOpen.value = false;
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
    <Button
      variant="ghost"
      size="icon"
      @click="toggleMobileMenu"
      aria-label="Menu"
    >
      <Menu class="h-5 w-5" />
    </Button>

    <!-- Mobile menu sheet -->
    <Sheet v-model:open="mobileMenuOpen">
      <SheetContent side="right" class="w-[280px] sm:w-[350px] p-0">
        <SheetHeader class="p-6 border-b">
          <SheetTitle class="flex items-center gap-2">
            <span class="text-primary text-xl">{{ $site.name }}</span>
          </SheetTitle>
        </SheetHeader>

        <div class="px-6 py-4">
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
              to="/auth/login"
              @click="closeMenu"
              class="flex items-center gap-2 py-2 text-sm font-medium hover:text-primary"
            >
              <LogIn class="h-4 w-4" />
              Client Login
            </NuxtLink>
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  </div>
</template>

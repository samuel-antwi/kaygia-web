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

const isOpen = ref(false);

function toggleMenu() {
  isOpen.value = !isOpen.value;
}

function closeMenu() {
  isOpen.value = false;
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
            <span class="text-primary text-xl">Kaygia</span>
            <span class="text-muted-foreground">Web</span>
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
              to="/"
              @click="closeMenu"
              class="flex items-center gap-2 py-2 text-sm font-medium hover:text-primary"
            >
              <Home class="h-4 w-4" />
              Home
            </NuxtLink>
            <NuxtLink
              to="/services"
              @click="closeMenu"
              class="flex items-center gap-2 py-2 text-sm font-medium hover:text-primary"
            >
              <Settings class="h-4 w-4" />
              Services
            </NuxtLink>
            <NuxtLink
              to="/about"
              @click="closeMenu"
              class="flex items-center gap-2 py-2 text-sm font-medium hover:text-primary"
            >
              <Users class="h-4 w-4" />
              About
            </NuxtLink>
            <NuxtLink
              to="/portfolio"
              @click="closeMenu"
              class="flex items-center gap-2 py-2 text-sm font-medium hover:text-primary"
            >
              <Briefcase class="h-4 w-4" />
              Portfolio
            </NuxtLink>
            <NuxtLink
              to="/contact"
              @click="closeMenu"
              class="flex items-center gap-2 py-2 text-sm font-medium hover:text-primary"
            >
              <Mail class="h-4 w-4" />
              Contact
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

<script setup lang="ts">
import { Sun, Moon } from "lucide-vue-next";
import site from "~/utils/config/site";

const colorMode = useColorMode();
const { $site = site } = useNuxtApp();

function toggleColorMode() {
  colorMode.preference = colorMode.value === "dark" ? "light" : "dark";
}
</script>

<template>
  <div class="flex min-h-screen flex-col antialiased bg-background">
    <!-- Header with logo and theme toggle -->
    <div class="fixed top-4 left-4 right-4 flex justify-between z-50">
      <!-- Logo with link to home page -->
      <NuxtLink
        to="/"
        class="flex items-center gap-2 font-bold text-foreground text-xl transition-colors cursor-pointer"
      >
        {{ $site.name }}
      </NuxtLink>

      <!-- Theme toggle -->
      <Button
        variant="ghost"
        size="icon"
        @click="toggleColorMode"
        aria-label="Toggle theme"
      >
        <span class="relative block h-5 w-5">
          <Sun
            v-show="colorMode.value === 'dark'"
            class="absolute inset-0 h-5 w-5"
          />
          <Moon
            v-show="colorMode.value !== 'dark'"
            class="absolute inset-0 h-5 w-5"
          />
        </span>
      </Button>
    </div>

    <!-- Main content -->
    <main class="flex-1">
      <slot />
    </main>
  </div>
</template>

<style scoped>
/* Add any additional styling here if needed */
</style>

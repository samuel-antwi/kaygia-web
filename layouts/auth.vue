<script setup lang="ts">
import { Sun, Moon } from "lucide-vue-next";
import site from "~/utils/config/site";

const { $site = site } = useNuxtApp();
</script>

<template>
  <div class="flex min-h-screen flex-col antialiased bg-background">
    <!-- Header with logo and theme toggle -->
    <div
      class="fixed top-4 sm:left-20 left-4 right-4 flex justify-between z-50"
    >
      <!-- Logo with link to home page -->
      <NuxtLink
        to="/"
        class="flex items-center gap-2 font-bold text-gray-100 text-xl transition-colors cursor-pointer"
      >
        {{ $site.name }}
      </NuxtLink>
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

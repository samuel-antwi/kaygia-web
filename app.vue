<script setup lang="ts">
import Toaster from "@/components/ui/toast/Toaster.vue";
import ErrorToastListener from "@/components/ErrorToastListener.vue";
// Main app component
</script>

<template>
  <NuxtLayout>
    <Toaster />
    <ErrorToastListener />
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { Mail, ArrowLeft } from "lucide-vue-next";

// We might need the email address later for the resend functionality
// const route = useRoute();
// const email = ref(route.query.email || '');

definePageMeta({
  layout: "auth",
});
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center px-4 py-12 bg-background"
  >
    <div
      class="w-full max-w-md overflow-hidden rounded-xl bg-card shadow-lg border border-border"
    >
      <div class="p-8 text-center">
        <!-- Blue Icon -->
        <div
          class="mx-auto w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-6"
        >
          <Mail class="h-8 w-8 text-blue-600 dark:text-blue-400" />
        </div>

        <!-- Text Content -->
        <h1 class="text-2xl font-semibold mb-2 text-foreground">
          Check your email
        </h1>
        <p class="text-base text-muted-foreground mb-4">
          We've sent a verification link to your email address.
        </p>
        <p class="text-sm text-muted-foreground/80 mb-8">
          Please click the link in the email to verify your account. If you
          don't see the email, check your spam folder.
        </p>

        <!-- Back to Login Link -->
        <Button
          @click="navigateTo('/auth/login')"
          variant="link"
          class="w-full h-9 text-sm"
        >
          <ArrowLeft class="h-4 w-4 mr-1" />
          Back to login
        </Button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Add any specific styles if needed */
</style>

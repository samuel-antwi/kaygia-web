<script setup lang="ts">
import {
  Mail,
  ArrowLeft,
  CheckCircle2,
  LogIn,
  RefreshCw,
  Home,
} from "lucide-vue-next";
const route = useRoute();
const token = route.params.token as string;
const success = ref<boolean | null>(null);
const message = ref<string>("");
const loading = ref<boolean>(true);

definePageMeta({
  layout: "auth",
});

onMounted(async () => {
  try {
    // Verify the token
    const response = await $fetch<{
      success: boolean;
      message?: string;
      error?: string;
    }>("/api/auth/verify-email", {
      method: "POST",
      body: { token },
    });

    success.value = response.success;
    message.value = response.success
      ? response.message || "Email verified successfully!"
      : response.error || "Failed to verify email";
  } catch (error: any) {
    success.value = false;
    message.value = error.message || "An error occurred during verification";
  } finally {
    loading.value = false;
  }
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
        <h1 class="text-3xl font-bold mb-6 text-foreground">
          Email Verification
        </h1>

        <!-- Loading state -->
        <div v-if="loading" class="py-10">
          <p class="mt-6 text-base text-muted-foreground">
            Verifying your email address...
          </p>
        </div>

        <!-- Success state -->
        <div v-else-if="success">
          <div
            class="mx-auto w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6"
          >
            <CheckCircle2
              class="h-12 w-12 text-green-500 dark:text-green-400"
            />
          </div>

          <h2 class="text-2xl font-semibold mb-3 text-foreground">
            Verification Successful
          </h2>
          <p class="text-base mb-8 text-muted-foreground">
            {{ message }}
          </p>

          <Button
            @click="navigateTo('/auth/login')"
            class="w-full h-12 mb-4 rounded-xl"
          >
            <LogIn class="h-5 w-5 mr-2" />
            Continue to Login
          </Button>
        </div>

        <!-- Error state -->
        <div v-else>
          <h2
            class="text-2xl font-semibold mb-2 text-red-600 dark:text-red-400"
          >
            Verification Failed
          </h2>
          <h3 class="text-base font-medium mb-4 text-foreground">
            Oops! We couldn't verify your email
          </h3>
          <p class="text-sm mb-8 text-muted-foreground">
            {{ message }}
          </p>

          <div class="space-y-4">
            <Button
              @click="navigateTo('/resend-verification')"
              class="w-full h-12 rounded-xl"
            >
              <RefreshCw class="h-5 w-5 mr-2" />
              Resend Verification Email
            </Button>

            <Button
              @click="navigateTo('/auth/login')"
              variant="outline"
              class="w-full h-12 rounded-xl"
            >
              <LogIn class="h-5 w-5 mr-2" />
              Back to Login
            </Button>

            <div class="pt-2">
              <Button
                @click="navigateTo('/')"
                variant="link"
                class="text-sm h-9"
              >
                <Home class="h-4 w-4 mr-1" />
                Return to Homepage
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Removed all animations */
</style>

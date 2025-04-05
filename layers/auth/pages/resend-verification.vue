<script setup lang="ts">
import {
  Mail,
  ArrowLeft,
  CheckCircle2,
  LogIn,
  Home,
  RefreshCw,
  AlertCircle,
} from "lucide-vue-next";

// Form state
const email = ref("");
const loading = ref(false);
const success = ref(false);
const error = ref("");
const message = ref("");

definePageMeta({
  layout: "auth",
});

// Form submit handler
const handleSubmit = async () => {
  try {
    loading.value = true;
    error.value = "";
    message.value = "";

    // Validate email
    if (!email.value) {
      error.value = "Email is required";
      return;
    }

    // Submit request to resend verification email
    const response = await $fetch<{
      success: boolean;
      message?: string;
      error?: string;
    }>("/api/auth/resend-verification", {
      method: "POST",
      body: { email: email.value },
    });

    if (response.success) {
      success.value = true;
      message.value =
        response.message || "Verification email sent. Please check your inbox.";
      email.value = ""; // Clear form
    } else {
      error.value = response.error || "Failed to send verification email";
    }
  } catch (err: any) {
    error.value = err.message || "An error occurred. Please try again.";
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center px-4 py-12 bg-background"
  >
    <div class="w-full max-w-md">
      <div class="text-center mb-6">
        <h1 class="text-3xl font-bold text-foreground">
          Resend Verification Email
        </h1>
      </div>

      <!-- Success state -->
      <div
        v-if="success"
        class="bg-card rounded-xl shadow-lg overflow-hidden border border-border"
      >
        <div class="p-6 text-center">
          <div
            class="mx-auto w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6"
          >
            <CheckCircle2
              class="h-12 w-12 text-green-500 dark:text-green-400"
            />
          </div>

          <h2 class="text-2xl font-bold mb-2 text-foreground">Email Sent</h2>
          <p class="text-muted-foreground mb-8">
            {{ message }}
          </p>

          <div class="space-y-4">
            <Button
              @click="navigateTo('/auth/login')"
              class="w-full h-12 rounded-xl"
            >
              <LogIn class="h-5 w-5 mr-2" />
              Back to Login
            </Button>

            <div class="pt-2">
              <Button @click="navigateTo('/')" variant="link" class="text-sm">
                <Home class="h-4 w-4 mr-1" />
                Return to Homepage
              </Button>
            </div>
          </div>
        </div>
      </div>

      <!-- Form state -->
      <div v-else class="bg-card rounded-xl shadow-lg p-8 border border-border">
        <Alert v-if="error" variant="destructive" class="mb-6">
          <AlertCircle class="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{{ error }}</AlertDescription>
        </Alert>

        <form @submit.prevent="handleSubmit" class="space-y-5">
          <div class="space-y-2">
            <Label for="email" class="text-sm font-medium">
              Email address
            </Label>
            <div class="relative">
              <div
                class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"
              >
                <Mail class="h-5 w-5 text-muted-foreground/70" />
              </div>
              <Input
                id="email"
                v-model="email"
                type="email"
                autocomplete="email"
                class="pl-10 h-12"
                :disabled="loading"
                placeholder="Enter your email address"
              />
            </div>
          </div>

          <Button
            type="submit"
            class="w-full h-12 rounded-md"
            :disabled="loading"
          >
            <span v-if="loading" class="flex items-center">
              <RefreshCw class="animate-spin h-5 w-5 mr-2" />
              Sending...
            </span>
            <span v-else class="flex items-center">
              <Mail class="h-5 w-5 mr-2" />
              Send Verification Email
            </span>
          </Button>

          <div class="text-center pt-2">
            <Button
              type="button"
              @click.prevent="navigateTo('/auth/login')"
              variant="link"
              class="text-sm"
            >
              <ArrowLeft class="h-4 w-4 mr-1" />
              Back to Login
            </Button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* No animations */
</style>

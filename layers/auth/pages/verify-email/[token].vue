<script setup lang="ts">
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
    class="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800"
  >
    <div
      class="w-full max-w-md overflow-hidden rounded-2xl transition-all duration-300 transform"
    >
      <div class="text-center">
        <h1 class="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
          Email Verification
        </h1>

        <!-- Loading state -->
        <div
          v-if="loading"
          class="py-10 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700"
        >
          <p class="mt-6 text-base text-gray-600 dark:text-gray-300">
            Verifying your email address...
          </p>
        </div>

        <!-- Success state -->
        <div
          v-else-if="success"
          class="animate-success-appear bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700"
        >
          <div
            class="mx-auto w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6"
          >
            <Icon
              name="lucide:check-circle-2"
              class="h-12 w-12 text-green-500 dark:text-green-400"
            />
          </div>

          <h2 class="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">
            Verification Successful
          </h2>
          <p class="text-base mb-8 text-gray-600 dark:text-gray-300">
            {{ message }}
          </p>

          <Button
            @click="navigateTo('/auth/login')"
            class="w-full h-12 mb-4 rounded-xl"
          >
            <Icon name="lucide:log-in" class="h-5 w-5 mr-2" />
            Continue to Login
          </Button>
        </div>

        <!-- Error state -->
        <div
          v-else
          class="animate-error-appear bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700"
        >
          <h2
            class="text-2xl font-semibold mb-2 text-red-600 dark:text-red-400"
          >
            Verification Failed
          </h2>
          <h3
            class="text-base font-medium mb-4 text-gray-800 dark:text-gray-200"
          >
            Oops! We couldn't verify your email
          </h3>
          <p class="text-sm mb-8 text-gray-600 dark:text-gray-400">
            {{ message }}
          </p>

          <div class="space-y-4">
            <Button
              @click="navigateTo('/resend-verification')"
              class="w-full h-12 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white"
            >
              <Icon name="lucide:refresh-cw" class="h-5 w-5 mr-2" />
              Resend Verification Email
            </Button>

            <Button
              @click="navigateTo('/auth/login')"
              variant="outline"
              class="w-full h-12 rounded-xl"
            >
              <Icon name="lucide:log-in" class="h-5 w-5 mr-2" />
              Back to Login
            </Button>

            <div class="pt-2">
              <NuxtLink
                to="/"
                class="inline-flex items-center text-sm text-primary hover:text-primary-focus dark:text-primary-light"
              >
                <Icon name="lucide:home" class="h-4 w-4 mr-1" />
                Return to Homepage
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-success-appear {
  animation: successAppear 0.5s ease-in-out;
}

@keyframes successAppear {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-error-appear {
  animation: errorAppear 0.7s cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes errorAppear {
  0% {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Removed all custom illustration CSS (envelope, letter, etc.) */

.dark .verification-failed-card {
  /* This class is no longer used, can be removed if desired */
  background-color: #1f2937; /* dark mode card bg */
}
</style>

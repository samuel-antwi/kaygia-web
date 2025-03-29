<script setup lang="ts">
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
    class="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900"
  >
    <div class="w-full max-w-md">
      <div class="text-center mb-6">
        <h1 class="text-3xl font-bold text-slate-900 dark:text-white">
          Resend Verification Email
        </h1>
      </div>

      <!-- Success state -->
      <div
        v-if="success"
        class="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden transition-all duration-500 transform animate-success-appear"
      >
        <div
          class="bg-gradient-to-r from-emerald-500 to-teal-500 h-40 flex items-center justify-center relative overflow-hidden"
        >
          <div
            class="relative z-10 w-24 h-24 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center animate-check-appear"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-12 w-12 text-emerald-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <div class="absolute inset-0 opacity-20">
            <div
              class="absolute top-10 left-10 w-20 h-20 rounded-full bg-white"
            ></div>
            <div
              class="absolute bottom-5 right-10 w-16 h-16 rounded-full bg-white"
            ></div>
            <div
              class="absolute top-20 right-20 w-10 h-10 rounded-full bg-white"
            ></div>
          </div>
        </div>

        <div class="p-6 text-center">
          <h2
            class="text-2xl font-bold mb-2 text-emerald-600 dark:text-emerald-400"
          >
            Email Sent
          </h2>
          <p class="text-slate-600 dark:text-slate-300 mb-8 max-w-xs mx-auto">
            {{ message }}
          </p>

          <div class="space-y-4">
            <NuxtLink
              to="/auth/login"
              class="btn-primary w-full py-3 px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white border-0 flex items-center justify-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13.8 12H3"
                ></path>
              </svg>
              Back to Login
            </NuxtLink>

            <NuxtLink
              to="/"
              class="inline-flex items-center text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 mr-1"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              Return to Homepage
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Form state -->
      <div
        v-else
        class="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden transition-all duration-300 transform animate-form-appear"
      >
        <div
          class="bg-gradient-to-r from-violet-500 to-indigo-500 h-40 flex items-center justify-center relative overflow-hidden"
        >
          <div class="relative z-10">
            <div class="paper-plane-container">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-16 w-16 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
              >
                <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                <path d="M22 7l-10 5-10-5"></path>
              </svg>
            </div>
          </div>
          <div class="absolute inset-0 opacity-20">
            <div
              class="absolute top-10 left-10 w-20 h-20 rounded-full bg-white"
            ></div>
            <div
              class="absolute bottom-5 right-10 w-16 h-16 rounded-full bg-white"
            ></div>
            <div
              class="absolute top-20 right-20 w-10 h-10 rounded-full bg-white"
            ></div>
          </div>
        </div>

        <div class="p-6">
          <div v-if="error" class="error-message mb-4 flex items-start">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 mr-2 flex-shrink-0 mt-0.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{{ error }}</span>
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-5">
            <div class="space-y-2">
              <label
                for="email"
                class="block text-sm font-medium text-left text-slate-700 dark:text-slate-300"
              >
                Email address
              </label>
              <div class="relative">
                <div
                  class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5 text-slate-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                    ></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </div>
                <input
                  id="email"
                  v-model="email"
                  type="email"
                  autocomplete="email"
                  class="pl-10 w-full h-12 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200"
                  :disabled="loading"
                  placeholder="Enter your email address"
                />
              </div>
            </div>

            <button
              type="submit"
              class="btn-primary w-full py-3 h-12 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white border-0 flex items-center justify-center gap-2 transition-all duration-300"
              :disabled="loading"
              :class="{ 'opacity-80 cursor-not-allowed': loading }"
            >
              <span v-if="loading" class="flex items-center">
                <svg
                  class="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Sending...
              </span>
              <span v-else class="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5 mr-1"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M22 2L11 13"></path>
                  <path d="M22 2l-7 20-4-9-9-4 20-7z"></path>
                </svg>
                Send Verification Email
              </span>
            </button>

            <div class="text-center pt-2">
              <NuxtLink
                to="/auth/login"
                class="inline-flex items-center text-sm text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 mr-1"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
                Back to Login
              </NuxtLink>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-success-appear {
  animation: successAppear 0.7s cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes successAppear {
  0% {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.animate-check-appear {
  animation: checkAppear 0.5s ease-out 0.3s both;
}

@keyframes checkAppear {
  0% {
    opacity: 0;
    transform: scale(0.75);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-form-appear {
  animation: formAppear 0.5s ease-out;
}

@keyframes formAppear {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.paper-plane-container {
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.btn-primary {
  position: relative;
  overflow: hidden;
}

.btn-primary::after {
  content: "";
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: -100%;
  background: linear-gradient(
    to right,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.2) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  transition: all 0.5s ease;
}

.btn-primary:hover::after {
  left: 100%;
}

.error-message {
  color: #ef4444;
  background-color: rgba(254, 226, 226, 0.5);
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
}

.dark .error-message {
  background-color: rgba(254, 202, 202, 0.1);
}
</style>

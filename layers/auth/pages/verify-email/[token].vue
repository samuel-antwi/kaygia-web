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
          <div class="relative mx-auto h-24 w-24">
            <div class="absolute inset-0 flex items-center justify-center">
              <div
                class="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"
              ></div>
            </div>
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="h-10 w-10 animate-pulse text-primary opacity-60">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-full w-full"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
          </div>
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-12 w-12 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.5"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h2 class="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">
            Verification Successful
          </h2>
          <p class="text-base mb-8 text-gray-600 dark:text-gray-300">
            {{ message }}
          </p>

          <NuxtLink
            to="/auth/login"
            class="btn btn-primary w-full h-12 mb-4 rounded-xl"
          >
            Continue to Login
          </NuxtLink>
        </div>

        <!-- Error state -->
        <div v-else class="animate-error-appear">
          <div class="verification-failed-card">
            <div class="error-illustration">
              <div class="envelope">
                <div class="envelope-back"></div>
                <div class="letter">
                  <div class="letter-content">
                    <div class="letter-warning">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path
                          d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
                        ></path>
                        <line x1="12" y1="9" x2="12" y2="13"></line>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                      </svg>
                    </div>
                  </div>
                </div>
                <div class="envelope-front-left"></div>
                <div class="envelope-front-right"></div>
                <div class="envelope-shadow"></div>
                <div class="decorative-lines">
                  <div class="line line1"></div>
                  <div class="line line2"></div>
                  <div class="line line3"></div>
                </div>
              </div>
            </div>

            <div class="verification-content">
              <h2
                class="text-2xl font-bold mb-1 text-red-600 dark:text-red-400"
              >
                Verification Failed
              </h2>
              <h3
                class="text-base font-medium mb-4 text-gray-800 dark:text-gray-200"
              >
                Oops! We couldn't verify your email
              </h3>
              <p
                class="text-sm mb-6 text-gray-600 dark:text-gray-400 max-w-xs mx-auto"
              >
                {{ message }}
              </p>

              <div class="action-buttons space-y-3">
                <NuxtLink
                  to="/resend-verification"
                  class="btn btn-solid w-full py-3 px-5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white border-0 flex items-center justify-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"
                    />
                  </svg>
                  Resend Verification Email
                </NuxtLink>

                <NuxtLink
                  to="/auth/login"
                  class="btn btn-outline w-full py-3 rounded-xl bg-white dark:bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200 flex items-center justify-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13.8 12H3"
                    />
                  </svg>
                  Back to Login
                </NuxtLink>

                <div class="pt-2">
                  <NuxtLink
                    to="/"
                    class="inline-flex items-center text-sm text-primary hover:text-primary-focus dark:text-primary-light"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-4 w-4 mr-1"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path
                        d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
                      ></path>
                      <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                    Return to Homepage
                  </NuxtLink>
                </div>
              </div>
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

.verification-failed-card {
  background-color: white;
  border-radius: 1.5rem;
  overflow: hidden;
  box-shadow:
    0 10px 25px -5px rgba(0, 0, 0, 0.1),
    0 8px 10px -6px rgba(0, 0, 0, 0.1);
  position: relative;
}

.error-illustration {
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%);
  height: 180px;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.envelope {
  position: relative;
  width: 120px;
  height: 80px;
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

.envelope-back {
  position: absolute;
  width: 100%;
  height: 100%;
  background: #f1f5f9;
  border-radius: 5px;
  z-index: 1;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.envelope-front-left,
.envelope-front-right {
  position: absolute;
  width: 0;
  height: 0;
  border-style: solid;
  bottom: 0;
  z-index: 3;
}

.envelope-front-left {
  border-width: 40px 0 0 60px;
  border-color: transparent transparent transparent #e2e8f0;
  left: 0;
}

.envelope-front-right {
  border-width: 40px 60px 0 0;
  border-color: transparent #e2e8f0 transparent transparent;
  right: 0;
}

.letter {
  position: absolute;
  top: -30px;
  width: 110px;
  height: 70px;
  background: white;
  border-radius: 5px;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pullOut 0.6s ease-out;
  transform-origin: bottom center;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

@keyframes pullOut {
  0% {
    transform: translateY(30px) scale(0.95);
  }
  50% {
    transform: translateY(-5px) scale(1.02);
  }
  100% {
    transform: translateY(0) scale(1);
  }
}

.letter-content {
  width: 80%;
  height: 80%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.letter-warning {
  color: #f43f5e;
  width: 40px;
  height: 40px;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.envelope-shadow {
  position: absolute;
  width: 110%;
  height: 20px;
  background: rgba(0, 0, 0, 0.1);
  bottom: -10px;
  left: -5%;
  border-radius: 50%;
  filter: blur(5px);
  z-index: 0;
}

.decorative-lines {
  position: absolute;
  width: 80%;
  height: 30px;
  bottom: 10px;
  left: 10%;
  z-index: 4;
}

.line {
  position: absolute;
  width: 100%;
  height: 3px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 1.5px;
}

.line1 {
  top: 0;
}
.line2 {
  top: 10px;
}
.line3 {
  top: 20px;
}

.verification-content {
  padding: 2rem 1.5rem;
}

.btn-solid {
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.btn-solid::after {
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

.btn-solid:hover::after {
  left: 100%;
}

.dark .verification-failed-card {
  background-color: #1f2937; /* dark mode card bg */
}

.dark .envelope-back {
  background: #374151;
}

.dark .envelope-front-left {
  border-color: transparent transparent transparent #4b5563;
}

.dark .envelope-front-right {
  border-color: transparent #4b5563 transparent transparent;
}

.dark .letter {
  background: #111827;
}

.dark .letter-warning {
  color: #f87171;
}

.dark .envelope-shadow {
  background: rgba(0, 0, 0, 0.3);
}
</style>

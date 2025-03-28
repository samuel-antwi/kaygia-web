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
    class="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800"
  >
    <div
      class="w-full max-w-md overflow-hidden rounded-2xl transition-all duration-300 transform"
    >
      <div class="text-center">
        <h1 class="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
          Resend Verification Email
        </h1>

        <!-- Success state -->
        <div v-if="success" class="animate-success-appear">
          <div class="verification-success-card">
            <div class="success-illustration">
              <div class="envelope">
                <div class="envelope-back"></div>
                <div class="letter letter-success">
                  <div class="letter-content">
                    <div class="letter-check">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
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
                class="text-2xl font-bold mb-1 text-green-600 dark:text-green-400"
              >
                Email Sent
              </h2>
              <p
                class="text-base mb-8 text-gray-600 dark:text-gray-400 max-w-xs mx-auto"
              >
                {{ message }}
              </p>

              <div class="action-buttons space-y-3">
                <NuxtLink
                  to="/auth/login"
                  class="btn btn-solid w-full py-3 px-5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white border-0 flex items-center justify-center gap-2"
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

        <!-- Form state -->
        <div v-else class="animate-form-appear">
          <div class="resend-form-card">
            <div class="form-illustration">
              <div class="envelope-animated">
                <div class="paper-plane">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path
                      d="M21.73 18.73L2.74 8.72c-.347-.175-.566-.516-.586-.895a1 1 0 0 1 .519-.949l18-9C21.014-2.3 21.5-2.1 21.8-1.8c.382.303.536.742.4 1.162l-3.48 12.8-1.35 4.27c-.121.419-.462.742-.887.837a1.14 1.14 0 0 1-1.022-.386L13 13.5l-3.5-3.5"
                    ></path>
                  </svg>
                </div>
                <div class="trail trail1"></div>
                <div class="trail trail2"></div>
                <div class="trail trail3"></div>
              </div>
            </div>

            <div class="form-content">
              <p v-if="error" class="error-message">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 inline-block mr-1"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                {{ error }}
              </p>

              <form @submit.prevent="handleSubmit" class="space-y-5">
                <div class="space-y-2">
                  <label for="email" class="block text-sm font-medium text-left"
                    >Email address</label
                  >
                  <div class="relative">
                    <div
                      class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-5 w-5 text-gray-400"
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
                      class="pl-10 input input-bordered w-full bg-white dark:bg-gray-800 rounded-xl h-12 focus:ring-2 focus:ring-primary focus:border-primary"
                      :disabled="loading"
                      placeholder="Enter your email address"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  class="btn btn-solid w-full py-3 h-12 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-0 flex items-center justify-center gap-2"
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

.verification-success-card,
.resend-form-card {
  background-color: white;
  border-radius: 1.5rem;
  overflow: hidden;
  box-shadow:
    0 10px 25px -5px rgba(0, 0, 0, 0.1),
    0 8px 10px -6px rgba(0, 0, 0, 0.1);
  position: relative;
}

.dark .verification-success-card,
.dark .resend-form-card {
  background-color: #1f2937;
}

.success-illustration,
.form-illustration {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  height: 180px;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-illustration {
  background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
}

.envelope {
  position: relative;
  width: 120px;
  height: 80px;
  animation: float 3s ease-in-out infinite;
}

.envelope-animated {
  position: relative;
  width: 140px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
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

.letter-success {
  border: 2px solid #d1fae5;
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

.letter-check {
  color: #10b981;
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
    transform: scale(1.1);
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

.verification-content,
.form-content {
  padding: 2rem 1.5rem;
}

.paper-plane {
  width: 50px;
  height: 50px;
  color: white;
  transform: rotate(15deg);
  animation: flying 4s ease-in-out infinite;
  position: relative;
  z-index: 10;
}

@keyframes flying {
  0% {
    transform: translate(-40px, 20px) rotate(15deg);
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  50% {
    transform: translate(0, 0) rotate(15deg);
  }
  80% {
    opacity: 1;
  }
  100% {
    transform: translate(40px, -20px) rotate(15deg);
    opacity: 0;
  }
}

.trail {
  position: absolute;
  height: 2px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 1px;
  animation: trail 4s ease-in-out infinite;
  transform-origin: left center;
  z-index: 5;
}

.trail1 {
  width: 40px;
  transform: rotate(20deg);
  opacity: 0.8;
}

.trail2 {
  width: 30px;
  transform: rotate(30deg);
  opacity: 0.6;
  animation-delay: 0.1s;
}

.trail3 {
  width: 20px;
  transform: rotate(40deg);
  opacity: 0.4;
  animation-delay: 0.2s;
}

@keyframes trail {
  0% {
    transform: translate(-70px, 30px) rotate(20deg) scaleX(0.1);
    opacity: 0;
  }
  30% {
    opacity: 0.6;
    transform: translate(-35px, 15px) rotate(20deg) scaleX(1);
  }
  60% {
    opacity: 0.4;
  }
  100% {
    transform: translate(30px, -15px) rotate(20deg) scaleX(0.1);
    opacity: 0;
  }
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

.error-message {
  color: #ef4444;
  background-color: rgba(254, 226, 226, 0.5);
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
}

.dark .error-message {
  background-color: rgba(254, 202, 202, 0.1);
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

.dark .letter-check {
  color: #34d399;
}

.dark .envelope-shadow {
  background: rgba(0, 0, 0, 0.3);
}
</style>

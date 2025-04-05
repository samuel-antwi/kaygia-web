<script setup lang="ts">
import { Mail, Lock, User, AlertCircle, Eye, EyeOff } from "lucide-vue-next";
import { z } from "zod";
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";

// Define page meta to use auth layout
definePageMeta({
  layout: "auth",
});

// Form schema using Zod with explicit error messages
const registerSchema = z
  .object({
    name: z.string().min(2, { message: "Full name is required" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Convert Zod schema to VeeValidate schema
const validationSchema = toTypedSchema(registerSchema);

// Use the form hook
const form = useForm({
  validationSchema: validationSchema,
  initialValues: {
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  },
});

// Password visibility states
const showPassword = ref(false);
const showConfirmPassword = ref(false);

// Toggle password visibility
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

const toggleConfirmPasswordVisibility = () => {
  showConfirmPassword.value = !showConfirmPassword.value;
};

// Form state
const loading = ref(false);
const error = ref("");

// Get auth composable
const { signUp } = useAuth();

// Handle registration form submission
const onSubmit = form.handleSubmit(async (values) => {
  try {
    loading.value = true;
    error.value = "";

    // Call our API endpoint via the auth composable
    const result = await signUp(values.email, values.password, {
      name: values.name,
    });

    if (!result?.success) {
      error.value = result?.error || "Registration failed. Please try again.";
      return;
    }

    // Navigate to check email page on success
    navigateTo("/auth/check-email");
  } catch (err: any) {
    error.value = err?.message || "Registration failed. Please try again.";
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="flex min-h-screen bg-background">
    <!-- Left side with background image and glass effect -->
    <div class="hidden lg:flex lg:w-1/2 relative overflow-hidden">
      <div
        class="absolute inset-0 bg-gradient-to-br from-primary to-primary-foreground/90"
      ></div>
      <div
        class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2064')] bg-cover bg-center opacity-20 mix-blend-overlay dark:opacity-10"
      ></div>
      <div class="absolute inset-0 backdrop-blur-sm"></div>

      <div
        class="relative z-10 flex flex-col justify-center px-12 w-full max-w-2xl mx-auto"
      >
        <div class="mb-8">
          <div
            class="h-12 w-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-6"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="h-6 w-6 text-white"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
              <path d="M2 17l10 5 10-5"></path>
              <path d="M2 12l10 5 10-5"></path>
            </svg>
          </div>
          <h1 class="text-5xl font-bold mb-4 text-white">Join Our Platform</h1>
          <p class="text-xl text-white/80 leading-relaxed">
            Create an account to get started with our services and manage your
            web development projects.
          </p>
        </div>

        <div class="space-y-8 mt-8">
          <div class="flex items-start space-x-4">
            <div
              class="rounded-full bg-white/10 backdrop-blur-md p-2 mt-1 flex-shrink-0"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div>
              <h3 class="text-white font-medium text-lg">
                Free Dashboard Access
              </h3>
              <p class="text-white/70">
                Access your project dashboard and monitor progress anytime
              </p>
            </div>
          </div>

          <div class="flex items-start space-x-4">
            <div
              class="rounded-full bg-white/10 backdrop-blur-md p-2 mt-1 flex-shrink-0"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div>
              <h3 class="text-white font-medium text-lg">
                Easy Project Requests
              </h3>
              <p class="text-white/70">
                Submit and manage project requests with our intuitive interface
              </p>
            </div>
          </div>

          <div class="flex items-start space-x-4">
            <div
              class="rounded-full bg-white/10 backdrop-blur-md p-2 mt-1 flex-shrink-0"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div>
              <h3 class="text-white font-medium text-lg">
                Secure Communication
              </h3>
              <p class="text-white/70">
                Private and secure communication channels with your team
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right side with form -->
    <div class="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
      <div class="w-full max-w-md">
        <div class="mb-10 text-center sm:text-left">
          <h2 class="text-3xl font-bold mb-3 text-foreground">
            Create your account
          </h2>
          <p class="text-muted-foreground">
            Already have an account?
            <NuxtLink
              to="/auth/login"
              class="text-primary font-medium hover:underline transition-colors"
            >
              Sign in
            </NuxtLink>
          </p>
        </div>

        <!-- Error alert -->
        <Alert v-if="error" variant="destructive" class="mb-6">
          <AlertCircle class="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {{ error }}
          </AlertDescription>
        </Alert>

        <form @submit="onSubmit" class="space-y-6">
          <!-- Name field -->
          <FormField v-slot="{ componentField }" name="name">
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <div class="relative">
                <div
                  class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none"
                >
                  <User class="h-5 w-5 text-muted-foreground" />
                </div>
                <FormControl>
                  <Input
                    id="name"
                    v-bind="componentField"
                    type="text"
                    placeholder="John Doe"
                    class="pl-12 h-12 text-base"
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Email field -->
          <FormField v-slot="{ componentField }" name="email">
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <div class="relative">
                <div
                  class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none"
                >
                  <Mail class="h-5 w-5 text-muted-foreground" />
                </div>
                <FormControl>
                  <Input
                    id="email"
                    v-bind="componentField"
                    type="email"
                    placeholder="name@example.com"
                    class="pl-12 h-12 text-base"
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Password field -->
          <FormField v-slot="{ componentField }" name="password">
            <FormItem>
              <FormLabel>Password</FormLabel>
              <div class="relative">
                <div
                  class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none"
                >
                  <Lock class="h-5 w-5 text-muted-foreground" />
                </div>
                <FormControl>
                  <Input
                    id="password"
                    v-bind="componentField"
                    :type="showPassword ? 'text' : 'password'"
                    class="pl-12 pr-12 h-12 text-base"
                    autocomplete="new-password"
                  />
                </FormControl>
                <button
                  type="button"
                  @click="togglePasswordVisibility"
                  class="absolute inset-y-0 right-0 flex items-center pr-4 cursor-pointer"
                  tabindex="-1"
                >
                  <Eye
                    v-if="!showPassword"
                    class="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors"
                  />
                  <EyeOff
                    v-else
                    class="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors"
                  />
                </button>
              </div>
              <p class="text-xs text-muted-foreground mt-1">
                Must be at least 8 characters long
              </p>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Confirm Password field -->
          <FormField v-slot="{ componentField }" name="confirmPassword">
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <div class="relative">
                <div
                  class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none"
                >
                  <Lock class="h-5 w-5 text-muted-foreground" />
                </div>
                <FormControl>
                  <Input
                    id="confirmPassword"
                    v-bind="componentField"
                    :type="showConfirmPassword ? 'text' : 'password'"
                    class="pl-12 pr-12 h-12 text-base"
                    autocomplete="new-password"
                  />
                </FormControl>
                <button
                  type="button"
                  @click="toggleConfirmPasswordVisibility"
                  class="absolute inset-y-0 right-0 flex items-center pr-4 cursor-pointer"
                  tabindex="-1"
                >
                  <Eye
                    v-if="!showConfirmPassword"
                    class="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors"
                  />
                  <EyeOff
                    v-else
                    class="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors"
                  />
                </button>
              </div>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Register button -->
          <Button
            type="submit"
            class="w-full h-12 text-base font-medium shadow-sm hover:shadow-md transition-all duration-200 mt-6"
            :disabled="loading"
          >
            <span v-if="loading" class="flex items-center justify-center">
              <svg
                class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
              Creating account...
            </span>
            <span v-else>Create Account</span>
          </Button>

          <p class="text-xs text-center text-muted-foreground mt-6">
            By creating an account, you agree to our
            <NuxtLink to="/terms" class="text-primary hover:underline"
              >Terms of Service</NuxtLink
            >
            and
            <NuxtLink to="/privacy" class="text-primary hover:underline"
              >Privacy Policy</NuxtLink
            >
          </p>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.form-appear {
  animation: fadeIn 0.5s ease-out forwards;
}
</style>

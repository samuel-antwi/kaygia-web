<script setup lang="ts">
import {
  Mail,
  Lock,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle,
} from "lucide-vue-next";
import { z } from "zod";
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";

// Define page meta to use auth layout
definePageMeta({
  layout: "auth",
});

// Login sidebar features
const loginFeatures = [
  {
    title: "Real-time Tracking",
    description: "Monitor project progress with live updates and notifications",
  },
  {
    title: "Team Communication",
    description: "Seamless messaging and file sharing with your entire team",
  },
  {
    title: "Change Management",
    description: "Request and implement updates with our intuitive workflow",
  },
];

// Form schema using Zod
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional().default(false),
});

// Convert Zod schema to VeeValidate schema
const validationSchema = toTypedSchema(loginSchema);

// Use the form hook
const form = useForm({
  validationSchema: validationSchema,
  initialValues: {
    email: "",
    password: "",
    rememberMe: false,
  },
});

// Password visibility state
const showPassword = ref(false);

// Toggle password visibility
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

// Form state
const loading = ref(false);
const error = ref("");
const successMessage = ref("");
const needsVerification = ref(false);
const userEmail = ref("");

// Check for password change message in URL
const route = useRoute();
if (route.query.message === "password_changed") {
  successMessage.value =
    "Your password has been changed successfully. Please sign in with your new password.";
}

// Get auth composable
const { signIn, initAuth, user } = useAuth();

// Handle login form submission
const onSubmit = form.handleSubmit(async (values) => {
  try {
    loading.value = true;
    error.value = "";
    needsVerification.value = false;

    // Call our API endpoint via the auth composable
    const result = await signIn(values.email, values.password);

    if (!result.success) {
      if (result.needsVerification) {
        needsVerification.value = true;
        userEmail.value = result.email || values.email;
      }
      error.value = result.error || "Invalid email or password";
      return;
    }

    // Initialize auth state
    await initAuth();

    // Navigate to dashboard on success
    navigateTo("/dashboard");
  } catch (err) {
    console.error("Login error:", err);
    error.value = "An unexpected error occurred. Please try again.";
  } finally {
    loading.value = false;
  }
});

// Handle resending verification email
const handleResend = () => {
  navigateTo("/resend-verification");
};
</script>

<template>
  <div class="flex min-h-screen bg-background">
    <!-- Left side with background image and glass effect -->
    <AuthSidebar
      title="Welcome Back"
      description="Log in to your account to continue managing your projects and client communications."
      :features="loginFeatures"
    />

    <!-- Right side with form -->
    <div class="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
      <div class="w-full max-w-md">
        <div class="mb-10 text-center sm:text-left">
          <h2 class="text-3xl font-bold mb-3 text-foreground">
            Sign in to your account
          </h2>
          <p class="text-muted-foreground">
            Don't have an account?
            <NuxtLink
              to="/auth/register"
              class="text-primary font-medium hover:underline transition-colors"
            >
              Create a free account
            </NuxtLink>
          </p>
        </div>

        <!-- Error alert -->
        <Alert v-if="error" variant="destructive" class="mb-6">
          <AlertCircle class="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {{ error }}
            <div v-if="needsVerification" class="mt-2">
              <button
                @click="handleResend"
                class="text-destructive-foreground underline font-medium"
              >
                Resend verification email
              </button>
            </div>
          </AlertDescription>
        </Alert>

        <!-- Success message -->
        <Alert v-if="successMessage" variant="default" class="mb-6">
          <CheckCircle class="h-4 w-4" />
          <AlertDescription>
            {{ successMessage }}
          </AlertDescription>
        </Alert>

        <form @submit="onSubmit" class="space-y-6">
          <!-- Email field -->
          <FormField v-slot="{ componentField }" name="email">
            <FormItem>
              <FormLabel>Email address</FormLabel>
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
              <div class="flex items-center justify-between">
                <FormLabel>Password</FormLabel>
                <NuxtLink
                  to="/auth/forgot-password"
                  class="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Forgot password?
                </NuxtLink>
              </div>
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
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Login button -->
          <Button
            type="submit"
            class="w-full h-12 text-base font-medium shadow-sm hover:shadow-md transition-all duration-200"
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
              Signing in...
            </span>
            <span v-else>Sign in</span>
          </Button>
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

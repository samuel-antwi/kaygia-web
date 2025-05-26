<template>
  <div class="min-h-screen flex items-center justify-center bg-background">
    <div class="max-w-md w-full px-6">
      <Card class="border-0 shadow-lg">
        <CardHeader class="text-center space-y-2 pb-4">
          <div
            class="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4"
          >
            <AlertTriangle class="h-8 w-8 text-destructive" />
          </div>
          <CardTitle class="text-2xl">
            {{
              error?.statusCode === 404
                ? "Page Not Found"
                : "Something went wrong"
            }}
          </CardTitle>
          <CardDescription>
            {{ getErrorMessage() }}
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <!-- Error Details (only in development for actual errors, not navigation errors) -->
          <Alert
            v-if="isDev && error?.stack && !isNavigationError"
            variant="destructive"
          >
            <AlertTriangle class="h-4 w-4" />
            <AlertTitle>Error Details</AlertTitle>
            <AlertDescription class="mt-2">
              <pre class="text-xs overflow-x-auto">{{ error.stack }}</pre>
            </AlertDescription>
          </Alert>

          <!-- Suggested Actions -->
          <div class="space-y-2">
            <Button @click="handleError" class="w-full" variant="default">
              <RefreshCw class="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button @click="goHome" class="w-full" variant="outline">
              <Home class="h-4 w-4 mr-2" />
              Go to Homepage
            </Button>
          </div>

          <!-- Additional navigation for 404 errors -->
          <div
            v-if="error?.statusCode === 404"
            class="grid grid-cols-2 gap-2 pt-2"
          >
            <Button
              variant="outline"
              size="sm"
              @click="navigateTo('/dashboard')"
            >
              <LayoutDashboard class="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            <Button
              variant="outline"
              size="sm"
              @click="navigateTo('/services')"
            >
              <Briefcase class="h-4 w-4 mr-2" />
              Services
            </Button>
          </div>

          <!-- Contact Support -->
          <div class="text-center pt-4 border-t">
            <p class="text-sm text-muted-foreground">
              If this problem persists, please
              <NuxtLink to="/contact" class="text-primary hover:underline">
                contact support
              </NuxtLink>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  AlertTriangle,
  RefreshCw,
  Home,
  LayoutDashboard,
  Briefcase,
} from "lucide-vue-next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const props = defineProps<{
  error: {
    url?: string;
    statusCode?: number;
    statusMessage?: string;
    message?: string;
    description?: string;
    data?: any;
    stack?: string;
  };
}>();

const isDev = process.env.NODE_ENV === "development";

// Check if this is a navigation/routing error
const isNavigationError = computed(() => {
  return (
    props.error?.statusCode === 404 ||
    props.error?.message?.includes("Page not found") ||
    props.error?.stack?.includes("router.js")
  );
});

// Get user-friendly error message
const getErrorMessage = () => {
  if (props.error?.statusCode === 404) {
    return "The page you're looking for doesn't exist.";
  }

  if (props.error?.statusCode === 403) {
    return "You don't have permission to access this resource.";
  }

  if (props.error?.statusCode === 401) {
    return "Please log in to continue.";
  }

  if (props.error?.statusCode === 500) {
    return "An internal server error occurred. We're working on fixing it.";
  }

  if (props.error?.statusCode === 503) {
    return "The service is temporarily unavailable. Please try again later.";
  }

  return (
    props.error?.statusMessage ||
    props.error?.message ||
    "An unexpected error occurred."
  );
};

// Handle different error types
const handleError = () => {
  if (props.error?.statusCode === 401) {
    // Redirect to login for authentication errors
    navigateTo("/auth/login");
  } else {
    // Clear error and reload
    clearError();
  }
};

// Navigate to home
const goHome = () => {
  navigateTo("/");
};

// Clear the error and redirect
const clearError = () => {
  // Clear error and let Nuxt handle the redirect
  clearNuxtError();
  navigateTo("/");
};

// Nuxt 3 utility to clear error
const clearNuxtError = () => {
  // This is the proper way to clear errors in Nuxt 3
  const nuxtApp = useNuxtApp();
  nuxtApp.payload.error = undefined;
};

// Log errors in production (you can send to error tracking service)
onMounted(() => {
  if (!isDev && props.error) {
    console.error("Global error:", props.error);
    // TODO: Send to error tracking service like Sentry
  }
});
</script>

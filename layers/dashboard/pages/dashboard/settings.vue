<script setup lang="ts">
import { useToast } from "../../../../components/ui/toast/use-toast";
import { AlertCircle, CheckCircle } from "lucide-vue-next";
import PasswordChangeForm from "../../components/PasswordChangeForm.vue";

definePageMeta({
  layout: "dashboard",
  middleware: "auth",
});

// Get user data from auth composable
// Note: nuxt-auth-utils might require a dedicated refresh function
// exposed via useAuth to update the session immediately after PATCH.
const { user, loading } = useAuth();
const { toast } = useToast();

// Form state (pre-fill with user data)
const userData = reactive({
  name: "",
  email: "",
  company: "",
});

// Form submission state
const isSubmitting = ref(false);
const submitError = ref<string | null>(null);

// Update form data when user data is loaded
watch(
  user,
  (currentUser) => {
    if (currentUser) {
      userData.name = currentUser.name || "";
      userData.email = currentUser.email || "";
      userData.company = currentUser.company || "";
    }
  },
  { immediate: true }
);

// Handle profile update submission
const handleSubmit = async () => {
  isSubmitting.value = true;
  submitError.value = null;

  // Basic validation
  if (!userData.name.trim()) {
    submitError.value = "Name cannot be empty.";
    isSubmitting.value = false;
    toast({
      title: "Validation Error",
      description: submitError.value ?? "An unknown validation error occurred.",
      variant: "destructive",
    });
    return;
  }

  try {
    // Use useFetch to call the API endpoint
    const { data, error } = await useFetch("/api/profile", {
      method: "PATCH",
      body: {
        name: userData.name.trim(),
        company: userData.company?.trim() || null,
      },
      // Automatically fetch updated session data upon success
      // watch: false, // Prevent automatic re-fetch if causing issues
    });

    // Check for network or server errors returned by useFetch
    if (error.value) {
      // Throw H3Error to be caught below
      throw error.value;
    }

    // Check if the API operation itself was successful (based on our backend response)
    if (data.value?.success && data.value.user) {
      // Session update is handled by backend via setUserSession.
      // Frontend state in `user` ref from `useAuth` should update automatically
      // due to reactivity or on next navigation/refresh if session fetch is triggered.
      // Explicit refresh might be needed if useAuth doesn't automatically watch session changes.
      // await refreshSession(); // Example if a refresh function exists

      toast({
        title: "Profile Updated",
        description: "Your profile information has been saved.",
        variant: "default",
      });
    } else {
      // Handle cases where the API returns success: false or unexpected data format
      // Although our current backend always throws error or returns success:true with user
      submitError.value =
        "Failed to update profile due to unexpected response.";
      toast({
        title: "Update Failed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  } catch (err: any) {
    console.error("Error updating profile:", err);
    submitError.value =
      err.data?.statusMessage ||
      err.message ||
      "An unexpected error occurred while updating profile.";
    toast({
      title: "Update Failed",
      description: "An unexpected error occurred.",
      variant: "destructive",
    });
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div>
    <h2 class="text-2xl sm:text-3xl font-bold mb-6">Settings</h2>

    <Card class="max-w-2xl">
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription> Update your personal details. </CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div v-if="loading && !user">
          <p>Loading user data...</p>
          <!-- Add a loading spinner or skeleton loader here if desired -->
        </div>
        <form v-else @submit.prevent="handleSubmit" class="space-y-4">
          <div class="space-y-2">
            <Label for="name">Name</Label>
            <Input
              id="name"
              v-model="userData.name"
              placeholder="Your name"
              class="h-12"
              :disabled="isSubmitting"
            />
          </div>

          <!-- Email (Read-only) -->
          <div class="space-y-2">
            <Label for="email">Email</Label>
            <Input
              id="email"
              v-model="userData.email"
              placeholder="Your email address"
              disabled
              class="h-12 bg-muted/50 cursor-not-allowed"
            />
            <p class="text-xs text-muted-foreground">
              Email cannot be changed.
            </p>
          </div>

          <!-- Company -->
          <div class="space-y-2">
            <Label for="company">Company (Optional)</Label>
            <Input
              id="company"
              v-model="userData.company"
              placeholder="Your company name"
              class="h-12"
              :disabled="isSubmitting"
            />
          </div>

          <!-- Update Button -->
          <div class="pt-4">
            <Button
              type="submit"
              class="w-full h-12"
              :disabled="isSubmitting || loading"
            >
              <span v-if="isSubmitting" class="mr-2">
                <div
                  class="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"
                ></div>
              </span>
              {{ isSubmitting ? "Updating..." : "Update Profile" }}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>

    <!-- Password Change Section -->
    <Card class="max-w-2xl mt-8">
      <CardHeader>
        <CardTitle>Password</CardTitle>
        <CardDescription> Change your account password. </CardDescription>
      </CardHeader>
      <CardContent>
        <PasswordChangeForm />
      </CardContent>
    </Card>
  </div>
</template>

<style scoped>
/* Add any page-specific styles here */
</style>

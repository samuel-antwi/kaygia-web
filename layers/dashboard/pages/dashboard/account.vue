<script setup lang="ts">
import { reactive, watch, ref } from "vue";
import { z } from "zod";
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { useToast } from "../../../../components/ui/toast/use-toast";
import PasswordChangeForm from "../../components/PasswordChangeForm.vue";
import { User, Settings, UserCircle } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

definePageMeta({
  layout: "dashboard",
  middleware: "auth",
});

// Get user data from auth composable
const { user, loading: authLoading } = useAuth(); // Renamed loading to authLoading to avoid conflict
const { toast } = useToast();

// Define Zod schema for profile form validation
const profileSchema = z.object({
  name: z.string().min(1, "Name cannot be empty"),
  email: z.string().email(), // Included for form state, but will be read-only
  company: z.string().min(1, "Company cannot be empty"), // Company is required
});

// Convert Zod schema to VeeValidate schema
const validationSchema = toTypedSchema(profileSchema);

// Use the form hook from VeeValidate
const form = useForm({
  validationSchema: validationSchema,
  initialValues: {
    name: user.value?.name ?? "",
    email: user.value?.email ?? "",
    company: user.value?.company ?? "",
  },
  // Keep existing values if the form is already dirty (optional, depends on desired UX)
  // keepValuesOnUnmount: true,
});

// Watch for user data to become available and reset the form to ensure initial values are set
watch(
  user,
  (currentUser) => {
    // Only reset form if currentUser is loaded (truthy) and form might not have initialized correctly
    // This prevents resetting with empty strings if user is initially null/undefined
    if (currentUser) {
      form.resetForm({
        values: {
          name: currentUser.name ?? "",
          email: currentUser.email ?? "",
          company: currentUser.company ?? "",
        },
        // Optionally reset errors and touched state as well
        // errors: {},
        // touched: {},
      });
    }
  },
  { immediate: true } // Run immediately in case user data is already available
);

// Handle profile update submission using VeeValidate's handleSubmit
const onSubmit = form.handleSubmit(async (values) => {
  // isSubmitting is handled by form.isSubmitting
  // submitError is handled by FormMessage component

  try {
    // Use useFetch to call the API endpoint with validated values
    const { data, error } = await useFetch("/api/profile", {
      method: "PATCH",
      body: {
        name: values.name.trim(),
        company: values.company?.trim() || null, // Send null if empty/undefined
      },
    });

    // Check for network or server errors returned by useFetch
    if (error.value) {
      throw error.value; // Throw H3Error to be caught below
    }

    // Check if the API operation itself was successful
    if (data.value?.success && data.value.user) {
      // Session update is handled by backend. useAuth should reflect changes.
      toast({
        title: "Profile Updated",
        description: "Your profile information has been saved.",
        variant: "default",
      });
      // Optionally reset form dirty state if desired after successful save
      // form.resetForm({ values: values });
    } else {
      // Handle unexpected API response format
      toast({
        title: "Update Failed",
        description: "Failed to update profile due to unexpected response.", // Removed data.value?.message as it might not exist
        variant: "destructive",
      });
    }
  } catch (err: any) {
    console.error("Error updating profile:", err);
    const errorMessage =
      err.data?.statusMessage ||
      err.message ||
      "An unexpected error occurred while updating profile.";
    toast({
      title: "Update Failed",
      description: errorMessage,
      variant: "destructive",
    });
    // Optionally set form-level error if needed, though toast is usually sufficient
    // form.setErrors({ root: errorMessage });
  }
  // form.isSubmitting is automatically managed by VeeValidate
});
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <!-- Header Section -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-foreground">Account Settings</h1>
      <p class="text-muted-foreground mt-2">
        Manage your account information and security preferences.
      </p>
    </div>

    <!-- Settings Grid -->
    <div class="grid gap-6">
      <!-- Profile Information Card -->
      <Card class="relative overflow-hidden">
        <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary/50"></div>
        <CardHeader>
          <div class="flex items-center space-x-3">
            <div class="p-2 bg-primary/10 rounded-lg">
              <User class="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal details and company information</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent class="space-y-6">
          <div v-if="authLoading && !user" class="space-y-4">
            <div class="flex items-center space-x-2 text-muted-foreground">
              <div class="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              <span>Loading your profile...</span>
            </div>
            <!-- Skeleton loaders -->
            <div class="space-y-4">
              <div class="space-y-2">
                <div class="h-4 bg-muted rounded w-16"></div>
                <div class="h-12 bg-muted rounded"></div>
              </div>
              <div class="space-y-2">
                <div class="h-4 bg-muted rounded w-20"></div>
                <div class="h-12 bg-muted rounded"></div>
              </div>
              <div class="space-y-2">
                <div class="h-4 bg-muted rounded w-24"></div>
                <div class="h-12 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        <form v-else @submit="onSubmit" class="space-y-4">
          <!-- Name Field -->
          <FormField v-slot="{ componentField }" name="name">
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  v-bind="componentField"
                  class="h-12"
                  :disabled="form.isSubmitting.value"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Email Field (Read-only) - Using FormField for consistency but binding directly to user email -->
          <FormField name="email">
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  id="email"
                  :value="user?.email"
                  disabled
                  class="h-12 bg-muted/50 cursor-not-allowed"
                />
              </FormControl>
              <FormDescription> Email cannot be changed. </FormDescription>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Company Field -->
          <FormField v-slot="{ componentField }" name="company">
            <FormItem>
              <FormLabel>Company</FormLabel>
              <FormControl>
                <Input
                  id="company"
                  type="text"
                  placeholder="Your company name"
                  v-bind="componentField"
                  class="h-12"
                  :disabled="form.isSubmitting.value"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Update Button -->
          <div class="pt-6 border-t">
            <div class="flex items-center justify-between">
              <div class="text-sm text-muted-foreground">
                Changes will be saved to your account
              </div>
              <Button
                type="submit"
                class="h-10 px-6"
                :disabled="form.isSubmitting.value || authLoading"
              >
                <span v-if="form.isSubmitting.value" class="mr-2">
                  <div
                    class="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"
                  ></div>
                </span>
                {{ form.isSubmitting.value ? "Saving..." : "Save Changes" }}
              </Button>
            </div>
          </div>
        </form>
        </CardContent>
      </Card>

      <!-- Security & Password Section -->
      <Card class="relative overflow-hidden">
        <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-red-500"></div>
        <CardHeader>
          <div class="flex items-center space-x-3">
            <div class="p-2 bg-orange-500/10 rounded-lg">
              <Settings class="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your password and account security</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <PasswordChangeForm />
        </CardContent>
      </Card>

      <!-- Account Information -->
      <Card class="relative overflow-hidden">
        <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
        <CardHeader>
          <div class="flex items-center space-x-3">
            <div class="p-2 bg-blue-500/10 rounded-lg">
              <UserCircle class="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>View your account details and status</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-4">
              <div>
                <Label class="text-sm font-medium text-muted-foreground">Account Status</Label>
                <div class="flex items-center space-x-2 mt-1">
                  <div class="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span class="text-sm">Active</span>
                </div>
              </div>
              <div>
                <Label class="text-sm font-medium text-muted-foreground">Member Since</Label>
                <p class="text-sm mt-1">{{ new Date(user?.createdAt || Date.now()).toLocaleDateString() }}</p>
              </div>
            </div>
            <div class="space-y-4">
              <div>
                <Label class="text-sm font-medium text-muted-foreground">Account Type</Label>
                <div class="flex items-center space-x-2 mt-1">
                  <Badge variant="secondary">{{ user?.role || 'Client' }}</Badge>
                </div>
              </div>
              <div>
                <Label class="text-sm font-medium text-muted-foreground">Email Verified</Label>
                <div class="flex items-center space-x-2 mt-1">
                  <div :class="user?.emailVerified ? 'h-2 w-2 bg-green-500 rounded-full' : 'h-2 w-2 bg-yellow-500 rounded-full'"></div>
                  <span class="text-sm">{{ user?.emailVerified ? 'Verified' : 'Pending' }}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<style scoped>
/* Add any page-specific styles here */
</style>

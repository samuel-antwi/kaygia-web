<script setup lang="ts">
import { ref } from "vue";
import { useToast } from "@/components/ui/toast/use-toast";
import { AlertCircle, Eye, EyeOff } from "lucide-vue-next";
import { useAuth } from "../../auth/composables/useAuth";
import { z } from "zod";
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";

const { toast } = useToast();
const { signOut } = useAuth();

// Define validation schema using zod
const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Initialize form
const form = useForm({
  validationSchema: toTypedSchema(passwordSchema),
  initialValues: {
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  },
});

// Password visibility toggles
const showCurrentPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);

// Submission state
const isSubmitting = ref(false);
const generalError = ref("");

const onSubmit = form.handleSubmit(async (values) => {
  if (isSubmitting.value) return; // Prevent double submission

  isSubmitting.value = true;
  generalError.value = "";

  try {
    // Call the change-password API endpoint
    const { data, error } = await useFetch("/api/profile/change-password", {
      method: "POST",
      body: {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      },
    });

    // Handle potential errors from useFetch or the API
    if (error.value) {
      throw error.value;
    }

    // Handle success
    if (data.value?.success) {
      toast({
        title: "Password Changed",
        description:
          "Your password has been updated successfully. For security reasons, you will be logged out.",
        duration: 5000,
      });

      // Reset form fields
      form.resetForm();

      // Wait a moment for the user to read the toast message before logout
      setTimeout(async () => {
        // Sign out the user
        await signOut();
        // Redirect to login page
        navigateTo("/auth/login?message=password_changed");
      }, 2000);
    } else {
      // Handle unexpected success=false case
      throw new Error(
        data.value?.message ||
          "Failed to change password due to an unexpected response."
      );
    }
  } catch (error: any) {
    console.error("Password change error:", error);
    // Extract error message from H3Error or generic error
    const errorMessage =
      error.data?.statusMessage ||
      error.message ||
      "Failed to change password.";

    generalError.value = errorMessage;

    // Check if it's about incorrect current password
    if (errorMessage.includes("Incorrect current password")) {
      form.setFieldError("currentPassword", errorMessage);
      generalError.value = ""; // Don't show general error in this case
    }

    toast({
      title: "Error",
      description: errorMessage ?? "An unknown error occurred.",
      variant: "destructive",
    });
  } finally {
    isSubmitting.value = false;
  }
});
</script>

<template>
  <form @submit="onSubmit" class="space-y-6">
    <Alert v-if="generalError" variant="destructive">
      <AlertCircle class="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{{ generalError }}</AlertDescription>
    </Alert>

    <!-- Current Password -->
    <FormField v-slot="{ componentField, errorMessage }" name="currentPassword">
      <FormItem>
        <FormLabel for="currentPassword">Current Password</FormLabel>
        <div class="relative">
          <FormControl>
            <Input
              id="currentPassword"
              v-bind="componentField"
              :type="showCurrentPassword ? 'text' : 'password'"
              class="h-12 pr-10"
              :disabled="isSubmitting"
            />
          </FormControl>
          <button
            type="button"
            @click="showCurrentPassword = !showCurrentPassword"
            class="absolute inset-y-0 right-0 flex items-center px-3"
          >
            <Eye
              v-if="!showCurrentPassword"
              class="h-4 w-4 text-muted-foreground"
            />
            <EyeOff v-else class="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
        <FormMessage />
      </FormItem>
    </FormField>

    <!-- New Password -->
    <FormField v-slot="{ componentField, errorMessage }" name="newPassword">
      <FormItem>
        <FormLabel for="newPassword">New Password</FormLabel>
        <div class="relative">
          <FormControl>
            <Input
              id="newPassword"
              v-bind="componentField"
              :type="showNewPassword ? 'text' : 'password'"
              class="h-12 pr-10"
              :disabled="isSubmitting"
            />
          </FormControl>
          <button
            type="button"
            @click="showNewPassword = !showNewPassword"
            class="absolute inset-y-0 right-0 flex items-center px-3"
          >
            <Eye
              v-if="!showNewPassword"
              class="h-4 w-4 text-muted-foreground"
            />
            <EyeOff v-else class="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
        <FormMessage />
      </FormItem>
    </FormField>

    <!-- Confirm Password -->
    <FormField v-slot="{ componentField, errorMessage }" name="confirmPassword">
      <FormItem>
        <FormLabel for="confirmPassword">Confirm New Password</FormLabel>
        <div class="relative">
          <FormControl>
            <Input
              id="confirmPassword"
              v-bind="componentField"
              :type="showConfirmPassword ? 'text' : 'password'"
              class="h-12 pr-10"
              :disabled="isSubmitting"
            />
          </FormControl>
          <button
            type="button"
            @click="showConfirmPassword = !showConfirmPassword"
            class="absolute inset-y-0 right-0 flex items-center px-3"
          >
            <Eye
              v-if="!showConfirmPassword"
              class="h-4 w-4 text-muted-foreground"
            />
            <EyeOff v-else class="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
        <FormMessage />
      </FormItem>
    </FormField>

    <div class="pt-2">
      <Button type="submit" class="w-full h-12" :disabled="isSubmitting">
        <span v-if="isSubmitting" class="mr-2">
          <div
            class="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"
          ></div>
        </span>
        {{ isSubmitting ? "Changing Password..." : "Change Password" }}
      </Button>
    </div>
  </form>
</template>

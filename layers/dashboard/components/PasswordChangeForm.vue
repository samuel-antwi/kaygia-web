<script setup lang="ts">
import { ref } from "vue";
import { useToast } from "@/components/ui/toast/use-toast";
import { AlertCircle } from "lucide-vue-next";

const { toast } = useToast();

// Form state
const currentPassword = ref("");
const newPassword = ref("");
const confirmPassword = ref("");

// Submission state
const isSubmitting = ref(false);
const errors = ref({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
  general: "",
});

// Basic validation function (can be expanded)
const validateForm = () => {
  errors.value = {
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    general: "",
  }; // Reset errors
  let isValid = true;

  if (!currentPassword.value) {
    errors.value.currentPassword = "Current password is required.";
    isValid = false;
  }
  if (!newPassword.value) {
    errors.value.newPassword = "New password is required.";
    isValid = false;
  }
  if (newPassword.value.length < 8) {
    // Example: Minimum length validation
    errors.value.newPassword =
      "New password must be at least 8 characters long.";
    isValid = false;
  }
  if (newPassword.value !== confirmPassword.value) {
    errors.value.confirmPassword = "Passwords do not match.";
    isValid = false;
  }

  return isValid;
};

const handleChangePassword = async () => {
  if (!validateForm()) {
    return;
  }

  isSubmitting.value = true;
  errors.value.general = ""; // Reset general error

  try {
    // Call the change-password API endpoint
    const { data, error } = await useFetch("/api/profile/change-password", {
      method: "POST",
      body: {
        currentPassword: currentPassword.value,
        newPassword: newPassword.value,
        confirmPassword: confirmPassword.value,
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
          data.value.message || "Your password has been updated successfully.",
      });
      // Reset form fields
      currentPassword.value = "";
      newPassword.value = "";
      confirmPassword.value = "";
    } else {
      // Handle cases where API returns success: false (though our backend throws errors)
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
    errors.value.general = errorMessage;
    // Show specific error if it's about incorrect current password
    if (errorMessage.includes("Incorrect current password")) {
      errors.value.currentPassword = errorMessage;
      errors.value.general = ""; // Don't show general error in this case
    }

    toast({
      title: "Error",
      description: errorMessage ?? "An unknown error occurred.",
      variant: "destructive",
    });
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <form @submit.prevent="handleChangePassword" class="space-y-6">
    <Alert v-if="errors.general" variant="destructive">
      <AlertCircle class="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{{ errors.general }}</AlertDescription>
    </Alert>

    <div class="space-y-2">
      <Label for="currentPassword">Current Password</Label>
      <Input
        id="currentPassword"
        type="password"
        v-model="currentPassword"
        required
        class="h-12"
        :class="{ 'border-destructive': errors.currentPassword }"
        :disabled="isSubmitting"
      />
      <p v-if="errors.currentPassword" class="text-sm text-destructive">
        {{ errors.currentPassword }}
      </p>
    </div>

    <div class="space-y-2">
      <Label for="newPassword">New Password</Label>
      <Input
        id="newPassword"
        type="password"
        v-model="newPassword"
        required
        class="h-12"
        :class="{ 'border-destructive': errors.newPassword }"
        :disabled="isSubmitting"
      />
      <p v-if="errors.newPassword" class="text-sm text-destructive">
        {{ errors.newPassword }}
      </p>
    </div>

    <div class="space-y-2">
      <Label for="confirmPassword">Confirm New Password</Label>
      <Input
        id="confirmPassword"
        type="password"
        v-model="confirmPassword"
        required
        class="h-12"
        :class="{ 'border-destructive': errors.confirmPassword }"
        :disabled="isSubmitting"
      />
      <p v-if="errors.confirmPassword" class="text-sm text-destructive">
        {{ errors.confirmPassword }}
      </p>
    </div>

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

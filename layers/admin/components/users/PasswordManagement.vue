<script setup lang="ts">
import { ref } from "vue";
import { useToast } from "@/components/ui/toast/use-toast";
import { AlertTriangle, Loader2, KeyRound, Mail, Shield, Clock } from "lucide-vue-next";

interface PasswordManagementProps {
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

// Define props
const props = defineProps<PasswordManagementProps>();

const { toast } = useToast();
const isResettingPassword = ref(false);
const dialogOpen = ref(false);

// Function to initiate password reset
const initiatePasswordReset = async () => {
  if (!props.user || isResettingPassword.value) return;

  isResettingPassword.value = true;

  try {
    const response = await $fetch<{ success: boolean; message?: string }>(
      `/api/admin/users/${props.user.id}/reset-password`,
      {
        method: "POST",
      }
    );

    if (response.success) {
      toast({
        title: "Password Reset Email Sent",
        description: `An email with reset instructions has been sent to ${props.user.email}`,
        variant: "default",
        duration: 5000,
      });
      dialogOpen.value = false;
    } else {
      toast({
        title: "Error",
        description: response.message || "Failed to send password reset email",
        variant: "destructive",
        duration: 5000,
      });
    }
  } catch (err: any) {
    const errorMessage =
      err.data?.statusMessage ||
      err.data?.message ||
      err.message ||
      "An error occurred while sending the password reset email";

    toast({
      title: "Error",
      description: errorMessage,
      variant: "destructive",
      duration: 5000,
    });
  } finally {
    isResettingPassword.value = false;
  }
};
</script>

<template>
  <Card class="border-0 shadow-md hover:shadow-lg transition-shadow">
    <CardHeader class="pb-4">
      <div class="flex items-start justify-between">
        <div>
          <CardTitle class="text-lg flex items-center gap-2">
            <div class="p-2 bg-primary/10 rounded-lg">
              <KeyRound class="h-5 w-5 text-primary" />
            </div>
            Password Management
          </CardTitle>
          <CardDescription class="mt-1.5">
            Reset user password and manage security
          </CardDescription>
        </div>
      </div>
    </CardHeader>
    <CardContent class="space-y-4">
      <!-- Security Info -->
      <div class="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div class="flex items-start gap-3">
          <Shield class="h-5 w-5 text-blue-600 mt-0.5" />
          <div class="flex-1">
            <p class="font-medium text-blue-900">Password Reset Process</p>
            <ul class="text-sm text-blue-700 mt-1 space-y-1">
              <li class="flex items-center gap-2">
                <Mail class="h-3 w-3" />
                Email sent to: {{ props.user.email }}
              </li>
              <li class="flex items-center gap-2">
                <Clock class="h-3 w-3" />
                Link expires after 1 hour
              </li>
              <li class="flex items-center gap-2">
                <KeyRound class="h-3 w-3" />
                Current password remains valid until reset
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div class="space-y-4">
          <Dialog v-model:open="dialogOpen">
            <DialogTrigger as-child>
              <Button class="w-full" variant="default">
                <Mail class="h-4 w-4 mr-2" />
                Send Password Reset Email
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Password Reset</DialogTitle>
                <DialogDescription>
                  This will send a password reset email to
                  <span class="font-medium">{{ props.user.email }}</span
                  >. The user will be able to set a new password by following
                  the link in the email.
                </DialogDescription>
              </DialogHeader>
              <Alert class="my-4 border-amber-200 bg-amber-50">
                <AlertTriangle class="h-4 w-4 text-amber-600" />
                <AlertTitle class="text-amber-800">Security Notice</AlertTitle>
                <AlertDescription class="text-amber-700">
                  The reset link will expire after 1 hour for security reasons. The user's current
                  password will remain valid until they complete the reset process.
                </AlertDescription>
              </Alert>
              <DialogFooter>
                <Button
                  variant="outline"
                  @click="dialogOpen = false"
                  :disabled="isResettingPassword"
                >
                  Cancel
                </Button>
                <Button
                  @click="initiatePasswordReset"
                  :disabled="isResettingPassword"
                >
                  <Loader2
                    v-if="isResettingPassword"
                    class="mr-2 h-4 w-4 animate-spin"
                  />
                  <span v-if="isResettingPassword">Sending...</span>
                  <span v-else>Send Reset Email</span>
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
      </div>
      
      <!-- Additional Actions -->
      <div class="pt-2 border-t">
        <p class="text-xs text-muted-foreground">
          Need to force a password change? Contact system support for additional security options.
        </p>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useToast } from "@/components/ui/toast/use-toast";
import { AlertTriangle, Loader2, KeyRound } from "lucide-vue-next";

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
  <Card>
    <CardHeader>
      <CardTitle class="flex items-center">
        <KeyRound class="h-5 w-5 mr-2" />
        Password Management
      </CardTitle>
    </CardHeader>
    <CardContent class="space-y-4">
      <p class="text-sm text-muted-foreground">
        Help the user reset their password or manage account security:
      </p>

      <div class="space-y-4">
        <!-- Password Reset Button -->
        <div>
          <Dialog v-model:open="dialogOpen">
            <DialogTrigger as-child>
              <Button
                variant="outline"
                class="w-full flex justify-between items-center"
              >
                <span>Send Password Reset Email</span>
                <KeyRound class="h-4 w-4 ml-2" />
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
              <Alert variant="destructive" class="my-4">
                <AlertTriangle class="h-4 w-4" />
                <AlertTitle>Important</AlertTitle>
                <AlertDescription>
                  The reset link will expire after 1 hour. The user's current
                  password will remain valid until they complete the reset
                  process.
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

        <p class="text-xs text-muted-foreground italic">
          The user will receive an email with a secure link to reset their
          password. The link will expire after 1 hour.
        </p>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useToast } from "@/components/ui/toast/use-toast";
import { AlertTriangle, Loader2, Mail, CheckCircle2 } from "lucide-vue-next";

interface EmailVerificationManagementProps {
  user: {
    id: string;
    name: string | null;
    email: string;
    emailVerified: boolean;
  };
  onVerificationChanged: () => Promise<void>;
}

// Define props
const props = defineProps<EmailVerificationManagementProps>();

const { toast } = useToast();
const isVerifying = ref(false);
const isSendingVerification = ref(false);
const confirmDialogOpen = ref(false);

// Function to manually verify the user's email
const verifyEmail = async () => {
  if (!props.user || isVerifying.value) return;

  isVerifying.value = true;

  try {
    const response = await $fetch<{ success: boolean; message?: string }>(
      `/api/admin/users/${props.user.id}/verify-email`,
      {
        method: "PUT",
      }
    );

    if (response.success) {
      await props.onVerificationChanged();
      toast({
        title: "Email Verified",
        description: response.message || "User email verified successfully.",
        variant: "default",
        duration: 5000,
      });
      confirmDialogOpen.value = false;
    } else {
      toast({
        title: "Error",
        description: response.message || "Failed to verify email",
        variant: "destructive",
        duration: 5000,
      });
    }
  } catch (err: any) {
    const errorMessage =
      err.data?.statusMessage ||
      err.data?.message ||
      err.message ||
      "An error occurred while verifying email";

    toast({
      title: "Error",
      description: errorMessage,
      variant: "destructive",
      duration: 5000,
    });
  } finally {
    isVerifying.value = false;
  }
};

// Function to resend verification email
const resendVerificationEmail = async () => {
  if (!props.user || isSendingVerification.value) return;

  isSendingVerification.value = true;

  try {
    const response = await $fetch<{ success: boolean; message?: string }>(
      `/api/admin/users/${props.user.id}/resend-verification`,
      {
        method: "POST",
      }
    );

    if (response.success) {
      toast({
        title: "Verification Email Sent",
        description:
          response.message || `Verification email sent to ${props.user.email}`,
        variant: "default",
        duration: 5000,
      });
    } else {
      toast({
        title: "Error",
        description: response.message || "Failed to send verification email",
        variant: "destructive",
        duration: 5000,
      });
    }
  } catch (err: any) {
    const errorMessage =
      err.data?.statusMessage ||
      err.data?.message ||
      err.message ||
      "An error occurred while sending verification email";

    toast({
      title: "Error",
      description: errorMessage,
      variant: "destructive",
      duration: 5000,
    });
  } finally {
    isSendingVerification.value = false;
  }
};
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle class="flex items-center">
        <span v-if="props.user.emailVerified">
          <CheckCircle2 class="h-5 w-5 mr-2 text-green-600" />
          Email Status: Verified
        </span>
        <span v-else>
          <Mail class="h-5 w-5 mr-2 text-orange-600" />
          Email Status: Not Verified
        </span>
      </CardTitle>
    </CardHeader>
    <CardContent class="space-y-4">
      <p class="text-sm text-muted-foreground">
        <span v-if="props.user.emailVerified">
          This user's email address ({{ props.user.email }}) has been verified.
        </span>
        <span v-else>
          This user's email address ({{ props.user.email }}) has not been
          verified yet. They may have limited functionality until they verify
          their email.
        </span>
      </p>

      <div class="space-y-4" v-if="!props.user.emailVerified">
        <Dialog v-model:open="confirmDialogOpen">
          <DialogTrigger as-child>
            <Button variant="default" class="w-full">
              Manually Verify Email
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Manually Verify Email</DialogTitle>
              <DialogDescription>
                This will mark
                <span class="font-medium">{{
                  props.user.name || props.user.email
                }}</span
                >'s email as verified without requiring them to complete the
                verification process.
              </DialogDescription>
            </DialogHeader>
            <Alert class="my-4">
              <AlertTriangle class="h-4 w-4" />
              <AlertTitle>Important</AlertTitle>
              <AlertDescription>
                Only do this if you're certain this is the user's correct email
                address. Manual verification bypasses security checks.
              </AlertDescription>
            </Alert>
            <DialogFooter>
              <Button
                variant="outline"
                @click="confirmDialogOpen = false"
                :disabled="isVerifying"
              >
                Cancel
              </Button>
              <Button
                variant="default"
                @click="verifyEmail"
                :disabled="isVerifying"
              >
                <Loader2 v-if="isVerifying" class="mr-2 h-4 w-4 animate-spin" />
                <span v-if="isVerifying">Verifying...</span>
                <span v-else>Verify Email</span>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Button
          variant="outline"
          class="w-full"
          @click="resendVerificationEmail"
          :disabled="isSendingVerification"
        >
          <Loader2
            v-if="isSendingVerification"
            class="mr-2 h-4 w-4 animate-spin"
          />
          <span v-if="isSendingVerification">Sending...</span>
          <span v-else>Resend Verification Email</span>
        </Button>
      </div>
    </CardContent>
  </Card>
</template>

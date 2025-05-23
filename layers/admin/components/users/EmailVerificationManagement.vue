<script setup lang="ts">
import { ref } from "vue";
import { useToast } from "@/components/ui/toast/use-toast";
import { AlertTriangle, Loader2, Mail, CheckCircle2, Send, ShieldCheck, AlertCircle } from "lucide-vue-next";

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
  <Card class="border-0 shadow-md hover:shadow-lg transition-shadow">
    <CardHeader class="pb-4">
      <div class="flex items-start justify-between">
        <div>
          <CardTitle class="text-lg flex items-center gap-2">
            <div class="p-2 bg-primary/10 rounded-lg">
              <Mail class="h-5 w-5 text-primary" />
            </div>
            Email Verification
          </CardTitle>
          <CardDescription class="mt-1.5">
            Manage email verification status
          </CardDescription>
        </div>
      </div>
    </CardHeader>
    <CardContent class="space-y-4">
      <!-- Verification Status -->
      <div 
        class="p-4 rounded-lg border-2"
        :class="{
          'bg-green-50 border-green-200': props.user.emailVerified,
          'bg-amber-50 border-amber-200': !props.user.emailVerified
        }"
      >
        <div class="flex items-center justify-between">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <component 
                :is="props.user.emailVerified ? CheckCircle2 : AlertCircle" 
                :class="props.user.emailVerified ? 'text-green-600' : 'text-amber-600'"
                class="h-5 w-5" 
              />
              <p class="font-medium" :class="props.user.emailVerified ? 'text-green-900' : 'text-amber-900'">
                {{ props.user.emailVerified ? 'Email Verified' : 'Email Not Verified' }}
              </p>
            </div>
            <p class="text-sm" :class="props.user.emailVerified ? 'text-green-700' : 'text-amber-700'">
              {{ props.user.email }}
            </p>
            <p v-if="!props.user.emailVerified" class="text-xs text-amber-600 mt-1">
              Limited functionality until email is verified
            </p>
          </div>
          <Badge 
            :variant="props.user.emailVerified ? 'default' : 'secondary'"
            :class="{
              'bg-green-100 text-green-800 border-green-300': props.user.emailVerified,
              'bg-amber-100 text-amber-800 border-amber-300': !props.user.emailVerified
            }"
          >
            {{ props.user.emailVerified ? 'VERIFIED' : 'PENDING' }}
          </Badge>
        </div>
      </div>

      <!-- Verification Actions -->
      <div v-if="props.user.emailVerified" class="flex items-center justify-center py-4">
        <div class="text-center">
          <CheckCircle2 class="h-8 w-8 text-green-600 mx-auto mb-2" />
          <p class="text-sm text-muted-foreground">Email verification complete</p>
        </div>
      </div>
      
      <div v-else class="space-y-3">
        <div class="grid grid-cols-1 gap-3">
          <Button
            variant="outline"
            class="w-full"
            @click="resendVerificationEmail"
            :disabled="isSendingVerification"
          >
            <Send class="h-4 w-4 mr-2" v-if="!isSendingVerification" />
            <Loader2
              v-if="isSendingVerification"
              class="h-4 w-4 mr-2 animate-spin"
            />
            {{ isSendingVerification ? 'Sending...' : 'Resend Verification Email' }}
          </Button>
          
          <Dialog v-model:open="confirmDialogOpen">
            <DialogTrigger as-child>
              <Button variant="default" class="w-full">
                <ShieldCheck class="h-4 w-4 mr-2" />
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
            <Alert class="my-4 border-amber-200 bg-amber-50">
              <AlertTriangle class="h-4 w-4 text-amber-600" />
              <AlertTitle class="text-amber-800">Security Warning</AlertTitle>
              <AlertDescription class="text-amber-700">
                Manual verification bypasses the normal security process. Only verify if you're 
                absolutely certain this email address belongs to the user.
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
        </div>
        
        <p class="text-xs text-center text-muted-foreground">
          Verification emails expire after 24 hours
        </p>
      </div>
    </CardContent>
  </Card>
</template>

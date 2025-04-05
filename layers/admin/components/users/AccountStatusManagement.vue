<script setup lang="ts">
import { ref } from "vue";
import { useToast } from "@/components/ui/toast/use-toast";
import { AlertTriangle, Loader2, UserX, UserCheck } from "lucide-vue-next";

interface AccountStatusManagementProps {
  user: {
    id: string;
    name: string | null;
    email: string;
    active: boolean;
  };
  onStatusChanged: () => Promise<void>;
}

// Define props
const props = defineProps<AccountStatusManagementProps>();

const { toast } = useToast();
const isChangingStatus = ref(false);
const dialogOpen = ref(false);

// Function to toggle account status
const toggleAccountStatus = async () => {
  if (!props.user || isChangingStatus.value) return;

  isChangingStatus.value = true;

  try {
    const newStatus = !props.user.active;
    const response = await $fetch<{ success: boolean; message?: string }>(
      `/api/admin/users/${props.user.id}/toggle-active`,
      {
        method: "PUT",
        body: { active: newStatus },
      }
    );

    if (response.success) {
      await props.onStatusChanged();
      toast({
        title: newStatus ? "Account Activated" : "Account Deactivated",
        description:
          response.message || `User account status updated successfully.`,
        variant: "default",
        duration: 5000,
      });
      dialogOpen.value = false;
    } else {
      toast({
        title: "Error",
        description: response.message || "Failed to update account status",
        variant: "destructive",
        duration: 5000,
      });
    }
  } catch (err: any) {
    const errorMessage =
      err.data?.statusMessage ||
      err.data?.message ||
      err.message ||
      "An error occurred while updating account status";

    toast({
      title: "Error",
      description: errorMessage,
      variant: "destructive",
      duration: 5000,
    });
  } finally {
    isChangingStatus.value = false;
  }
};
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle class="flex items-center">
        <span v-if="props.user.active">
          <UserCheck class="h-5 w-5 mr-2 text-green-600" />
          Account Status: Active
        </span>
        <span v-else>
          <UserX class="h-5 w-5 mr-2 text-red-600" />
          Account Status: Inactive
        </span>
      </CardTitle>
    </CardHeader>
    <CardContent class="space-y-4">
      <p class="text-sm text-muted-foreground">
        <span v-if="props.user.active">
          This user can currently log in and access the system.
        </span>
        <span v-else>
          This user cannot currently log in. Their account has been deactivated.
        </span>
      </p>

      <div class="space-y-4">
        <Dialog v-model:open="dialogOpen">
          <DialogTrigger as-child>
            <Button
              :variant="props.user.active ? 'destructive' : 'default'"
              class="w-full flex justify-between items-center"
            >
              <span v-if="props.user.active">Deactivate Account</span>
              <span v-else>Activate Account</span>
              <span v-if="props.user.active">
                <UserX class="h-4 w-4 ml-2" />
              </span>
              <span v-else>
                <UserCheck class="h-4 w-4 ml-2" />
              </span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {{
                  props.user.active ? "Deactivate Account" : "Activate Account"
                }}
              </DialogTitle>
              <DialogDescription>
                <span v-if="props.user.active">
                  This will prevent
                  <span class="font-medium">{{
                    props.user.name || props.user.email
                  }}</span>
                  from logging in. Their data will be preserved.
                </span>
                <span v-else>
                  This will allow
                  <span class="font-medium">{{
                    props.user.name || props.user.email
                  }}</span>
                  to log in again.
                </span>
              </DialogDescription>
            </DialogHeader>
            <Alert variant="destructive" class="my-4" v-if="props.user.active">
              <AlertTriangle class="h-4 w-4" />
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                The user will immediately lose access to their account and any
                ongoing sessions will be terminated.
              </AlertDescription>
            </Alert>
            <DialogFooter>
              <Button
                variant="outline"
                @click="dialogOpen = false"
                :disabled="isChangingStatus"
              >
                Cancel
              </Button>
              <Button
                :variant="props.user.active ? 'destructive' : 'default'"
                @click="toggleAccountStatus"
                :disabled="isChangingStatus"
              >
                <Loader2
                  v-if="isChangingStatus"
                  class="mr-2 h-4 w-4 animate-spin"
                />
                <span v-if="isChangingStatus">Updating...</span>
                <span v-else>
                  {{ props.user.active ? "Deactivate" : "Activate" }}
                </span>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </CardContent>
  </Card>
</template>

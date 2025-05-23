<script setup lang="ts">
import { ref } from "vue";
import { useToast } from "@/components/ui/toast/use-toast";
import { AlertTriangle, Loader2, UserX, UserCheck, CheckCircle, XCircle, AlertCircle } from "lucide-vue-next";

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
  <Card class="border-0 shadow-md hover:shadow-lg transition-shadow">
    <CardHeader class="pb-4">
      <div class="flex items-start justify-between">
        <div>
          <CardTitle class="text-lg flex items-center gap-2">
            <div class="p-2 bg-primary/10 rounded-lg">
              <component 
                :is="props.user.active ? UserCheck : UserX" 
                :class="props.user.active ? 'text-green-600' : 'text-red-600'"
                class="h-5 w-5" 
              />
            </div>
            Account Status
          </CardTitle>
          <CardDescription class="mt-1.5">
            Control user access to the system
          </CardDescription>
        </div>
      </div>
    </CardHeader>
    <CardContent class="space-y-4">
      <!-- Status Display -->
      <div 
        class="p-4 rounded-lg border-2"
        :class="{
          'bg-green-50 border-green-200': props.user.active,
          'bg-red-50 border-red-200': !props.user.active
        }"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium flex items-center gap-2">
              <component 
                :is="props.user.active ? CheckCircle : XCircle" 
                :class="props.user.active ? 'text-green-600' : 'text-red-600'"
                class="h-5 w-5" 
              />
              {{ props.user.active ? 'Active Account' : 'Inactive Account' }}
            </p>
            <p class="text-sm mt-1" :class="props.user.active ? 'text-green-700' : 'text-red-700'">
              <span v-if="props.user.active">
                User can log in and access the system
              </span>
              <span v-else>
                User is blocked from accessing the system
              </span>
            </p>
          </div>
          <Badge 
            :variant="props.user.active ? 'default' : 'destructive'"
            :class="{
              'bg-green-100 text-green-800 border-green-300': props.user.active,
              'bg-red-100 text-red-800 border-red-300': !props.user.active
            }"
          >
            {{ props.user.active ? 'ACTIVE' : 'INACTIVE' }}
          </Badge>
        </div>
      </div>

      <!-- Action Section -->
      <div class="space-y-4">
        <Alert v-if="!props.user.active" class="border-amber-200 bg-amber-50">
          <AlertCircle class="h-4 w-4 text-amber-600" />
          <AlertDescription class="text-amber-700">
            This user cannot access their account until it is reactivated.
          </AlertDescription>
        </Alert>
        
        <Dialog v-model:open="dialogOpen">
          <DialogTrigger as-child>
            <Button
              :variant="props.user.active ? 'outline' : 'default'"
              class="w-full"
              :class="{
                'border-red-200 hover:bg-red-50 hover:text-red-700': props.user.active,
                'bg-green-600 hover:bg-green-700': !props.user.active
              }"
            >
              <component 
                :is="props.user.active ? UserX : UserCheck" 
                class="h-4 w-4 mr-2" 
              />
              {{ props.user.active ? 'Deactivate Account' : 'Activate Account' }}
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
            <Alert 
              :variant="props.user.active ? 'destructive' : 'default'" 
              class="my-4"
              :class="{
                'border-red-200 bg-red-50': props.user.active,
                'border-green-200 bg-green-50': !props.user.active
              }"
            >
              <component 
                :is="props.user.active ? AlertTriangle : CheckCircle" 
                class="h-4 w-4"
                :class="{
                  'text-red-600': props.user.active,
                  'text-green-600': !props.user.active
                }" 
              />
              <AlertTitle :class="props.user.active ? 'text-red-800' : 'text-green-800'">
                {{ props.user.active ? 'Warning' : 'Note' }}
              </AlertTitle>
              <AlertDescription :class="props.user.active ? 'text-red-700' : 'text-green-700'">
                <span v-if="props.user.active">
                  The user will immediately lose access to their account and any
                  ongoing sessions will be terminated.
                </span>
                <span v-else>
                  The user will regain full access to their account and can log in immediately.
                </span>
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

<script setup lang="ts">
import { ref, computed } from "vue";
import { useToast } from "@/components/ui/toast/use-toast";
import {
  AlertTriangle,
  Loader2,
  UserCog,
  ShieldCheck,
  Key,
} from "lucide-vue-next";
import { hasAdminAccess } from "../../utils/adminAccess";

interface RoleManagementProps {
  user: {
    id: string;
    name: string | null;
    email: string;
    role: string;
  };
  currentUser: {
    id: string;
    role: string;
  };
  onRoleChanged: () => Promise<void>;
}

// Define props and emits
const props = defineProps<RoleManagementProps>();

const { toast } = useToast();
const isChangingRole = ref(false);

// Computed property to check if current user is a super admin
const isSuperAdmin = computed(() => props.currentUser.role === "SUPER_ADMIN");

// Computed property to check if we can manage roles
const canManageRoles = computed(() => {
  // Only super admins can change roles
  return isSuperAdmin.value;
});

// Function to change user role
const changeUserRole = async (newRole: string) => {
  if (!props.user || isChangingRole.value) return;

  // Don't do anything if trying to set the same role
  if (props.user.role === newRole) return;

  // Only Super Admin can change roles
  if (!canManageRoles.value) {
    toast({
      title: "Permission Denied",
      description: "Only Super Admins can change user roles",
      variant: "destructive",
    });
    return;
  }

  isChangingRole.value = true;

  try {
    const response = await $fetch<{ success: boolean; message?: string }>(
      `/api/admin/users/${props.user.id}/role`,
      {
        method: "PUT",
        body: { role: newRole },
      }
    );

    if (response.success) {
      await props.onRoleChanged();
      toast({
        title: "Role Updated",
        description: `User ${props.user.name || props.user.email} is now a ${newRole}`,
        variant: "default",
        duration: 3000,
      });
    } else {
      toast({
        title: "Error",
        description: response.message || "Failed to update user role",
        variant: "destructive",
        duration: 3000,
      });
    }
  } catch (err: any) {
    const errorMessage =
      err.data?.statusMessage ||
      err.data?.message ||
      err.message ||
      "An error occurred while updating the role";

    toast({
      title: "Error",
      description: errorMessage,
      variant: "destructive",
      duration: 3000,
    });
  } finally {
    isChangingRole.value = false;
  }
};
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Role Management</CardTitle>
    </CardHeader>
    <CardContent class="space-y-4">
      <p class="text-sm text-muted-foreground mb-2">
        Change user's role in the system:
      </p>

      <div
        v-if="!canManageRoles"
        class="text-sm p-4 border rounded-md bg-muted/30"
      >
        <AlertTriangle class="h-4 w-4 inline-block mr-2 text-amber-500" />
        <span>Only Super Admins can change user roles</span>
      </div>

      <div v-else class="relative space-y-2">
        <Button
          variant="outline"
          size="sm"
          class="w-full flex items-center justify-between"
          :class="{ 'opacity-50': isChangingRole }"
          :disabled="isChangingRole || props.user.role === 'CLIENT'"
          @click="changeUserRole('CLIENT')"
        >
          <div class="flex items-center">
            <UserCog class="h-4 w-4 mr-2" />
            <span>Set as CLIENT</span>
          </div>
          <span v-if="props.user.role === 'CLIENT'"> (Current) </span>
        </Button>

        <Button
          variant="default"
          size="sm"
          class="w-full flex items-center justify-between"
          :class="{ 'opacity-50': isChangingRole }"
          :disabled="isChangingRole || props.user.role === 'ADMIN'"
          @click="changeUserRole('ADMIN')"
        >
          <div class="flex items-center">
            <ShieldCheck class="h-4 w-4 mr-2" />
            <span>Set as ADMIN</span>
          </div>
          <span v-if="props.user.role === 'ADMIN'"> (Current) </span>
        </Button>

        <Button
          variant="destructive"
          size="sm"
          class="w-full flex items-center justify-between"
          :class="{ 'opacity-50': isChangingRole }"
          :disabled="isChangingRole || props.user.role === 'SUPER_ADMIN'"
          @click="changeUserRole('SUPER_ADMIN')"
        >
          <div class="flex items-center">
            <Key class="h-4 w-4 mr-2" />
            <span>Set as SUPER ADMIN</span>
          </div>
          <span v-if="props.user.role === 'SUPER_ADMIN'"> (Current) </span>
        </Button>

        <!-- Loading spinner overlay -->
        <div
          v-if="isChangingRole"
          class="absolute inset-0 flex items-center justify-center bg-background/50 rounded"
        >
          <Loader2 class="h-4 w-4 animate-spin" />
        </div>
      </div>

      <Alert class="mt-2" :variant="canManageRoles ? 'destructive' : 'default'">
        <AlertTriangle class="h-4 w-4" />
        <AlertTitle>Important</AlertTitle>
        <AlertDescription>
          <p>
            Changing a user's role affects their permissions and access across
            the system.
          </p>
          <p v-if="canManageRoles" class="mt-1 font-semibold">
            Super Admins have full control over the entire system including role
            management.
          </p>
        </AlertDescription>
      </Alert>
    </CardContent>
  </Card>
</template>

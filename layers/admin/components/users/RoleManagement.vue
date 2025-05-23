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
  <Card class="border-0 shadow-md hover:shadow-lg transition-shadow">
    <CardHeader class="pb-4">
      <div class="flex items-start justify-between">
        <div>
          <CardTitle class="text-lg flex items-center gap-2">
            <div class="p-2 bg-primary/10 rounded-lg">
              <ShieldCheck class="h-5 w-5 text-primary" />
            </div>
            Role Management
          </CardTitle>
          <CardDescription class="mt-1.5">
            Control user permissions and access levels
          </CardDescription>
        </div>
      </div>
    </CardHeader>
    <CardContent class="space-y-4">
      <!-- Current Role Display -->
      <div class="p-4 bg-muted/50 rounded-lg border">
        <p class="text-xs text-muted-foreground uppercase tracking-wide mb-1">Current Role</p>
        <div class="flex items-center gap-2">
          <Badge 
            :class="{
              'bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0': props.user.role === 'SUPER_ADMIN',
              'bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0': props.user.role === 'ADMIN',
              'bg-slate-100 text-slate-700 border-slate-200': props.user.role === 'CLIENT',
            }"
            class="px-3 py-1"
          >
            <component 
              :is="props.user.role === 'SUPER_ADMIN' ? Key : props.user.role === 'ADMIN' ? ShieldCheck : UserCog" 
              class="h-3 w-3 mr-1" 
            />
            {{ props.user.role }}
          </Badge>
        </div>
      </div>

      <Alert v-if="!canManageRoles" class="border-amber-200 bg-amber-50">
        <AlertTriangle class="h-4 w-4 text-amber-600" />
        <AlertTitle class="text-amber-800">Permission Required</AlertTitle>
        <AlertDescription class="text-amber-700">
          Only Super Admins can change user roles. Contact a Super Admin if you need to modify this user's permissions.
        </AlertDescription>
      </Alert>

      <div v-else class="space-y-3">
        <p class="text-sm text-muted-foreground">Select a new role:</p>
        
        <div class="grid gap-3">
          <!-- Client Role Option -->
          <button
            @click="changeUserRole('CLIENT')"
            :disabled="isChangingRole || props.user.role === 'CLIENT'"
            class="relative p-4 rounded-lg border-2 text-left transition-all"
            :class="{
              'border-primary bg-primary/5 cursor-not-allowed': props.user.role === 'CLIENT',
              'border-gray-200 hover:border-gray-300 hover:bg-gray-50': props.user.role !== 'CLIENT' && !isChangingRole,
              'opacity-50 cursor-not-allowed': isChangingRole
            }"
          >
            <div class="flex items-start gap-3">
              <div class="p-2 bg-gray-100 rounded-lg">
                <UserCog class="h-5 w-5 text-gray-600" />
              </div>
              <div class="flex-1">
                <div class="flex items-center gap-2">
                  <span class="font-medium">Client</span>
                  <Badge v-if="props.user.role === 'CLIENT'" variant="secondary" class="text-xs">Current</Badge>
                </div>
                <p class="text-sm text-muted-foreground mt-1">
                  Basic access to own projects and support tickets
                </p>
              </div>
            </div>
          </button>

          <!-- Admin Role Option -->
          <button
            @click="changeUserRole('ADMIN')"
            :disabled="isChangingRole || props.user.role === 'ADMIN'"
            class="relative p-4 rounded-lg border-2 text-left transition-all"
            :class="{
              'border-primary bg-primary/5 cursor-not-allowed': props.user.role === 'ADMIN',
              'border-blue-200 hover:border-blue-300 hover:bg-blue-50': props.user.role !== 'ADMIN' && !isChangingRole,
              'opacity-50 cursor-not-allowed': isChangingRole
            }"
          >
            <div class="flex items-start gap-3">
              <div class="p-2 bg-blue-100 rounded-lg">
                <ShieldCheck class="h-5 w-5 text-blue-600" />
              </div>
              <div class="flex-1">
                <div class="flex items-center gap-2">
                  <span class="font-medium">Admin</span>
                  <Badge v-if="props.user.role === 'ADMIN'" variant="secondary" class="text-xs">Current</Badge>
                </div>
                <p class="text-sm text-muted-foreground mt-1">
                  Manage all projects, users, and system content
                </p>
              </div>
            </div>
          </button>

          <!-- Super Admin Role Option -->
          <button
            @click="changeUserRole('SUPER_ADMIN')"
            :disabled="isChangingRole || props.user.role === 'SUPER_ADMIN'"
            class="relative p-4 rounded-lg border-2 text-left transition-all"
            :class="{
              'border-primary bg-primary/5 cursor-not-allowed': props.user.role === 'SUPER_ADMIN',
              'border-purple-200 hover:border-purple-300 hover:bg-purple-50': props.user.role !== 'SUPER_ADMIN' && !isChangingRole,
              'opacity-50 cursor-not-allowed': isChangingRole
            }"
          >
            <div class="flex items-start gap-3">
              <div class="p-2 bg-purple-100 rounded-lg">
                <Key class="h-5 w-5 text-purple-600" />
              </div>
              <div class="flex-1">
                <div class="flex items-center gap-2">
                  <span class="font-medium">Super Admin</span>
                  <Badge v-if="props.user.role === 'SUPER_ADMIN'" variant="secondary" class="text-xs">Current</Badge>
                </div>
                <p class="text-sm text-muted-foreground mt-1">
                  Full system control including role management
                </p>
              </div>
            </div>
          </button>
        </div>

        <!-- Loading Overlay -->
        <div
          v-if="isChangingRole"
          class="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg z-10"
        >
          <div class="flex flex-col items-center gap-2">
            <Loader2 class="h-6 w-6 animate-spin text-primary" />
            <p class="text-sm font-medium">Updating role...</p>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

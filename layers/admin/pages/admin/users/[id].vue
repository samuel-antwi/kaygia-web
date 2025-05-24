<script setup lang="ts">
import { computed, ref } from "vue";
import {
  AlertTriangle,
  ArrowLeft,
  Loader2,
  Mail,
  Building,
  Calendar,
  UserCog,
  Shield,
  Activity,
  Clock,
  MoreVertical,
  Edit,
  CheckCircle,
  XCircle,
  AlertCircle,
  Settings,
  BarChart,
  Users,
  FolderOpen,
  MessageSquare,
  UserX,
  RotateCcw,
} from "lucide-vue-next";

// Import UI Components
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import the user components
import EditProfileForm from "../../../components/users/EditProfileForm.vue";
import RoleManagement from "../../../components/users/RoleManagement.vue";
import PasswordManagement from "../../../components/users/PasswordManagement.vue";
import AccountStatusManagement from "../../../components/users/AccountStatusManagement.vue";
import EmailVerificationManagement from "../../../components/users/EmailVerificationManagement.vue";
import UserStats from "../../../components/users/UserStats.vue";
import RecentItems from "../../../components/users/RecentItems.vue";

// Import Composables
import { useFormatting } from "~/layers/admin/composables/useFormatting";
import { hasAdminAccess, canDeleteUsers, isSuperAdmin } from "~/layers/admin/utils/adminAccess";
import { useToast } from "@/components/ui/toast/use-toast";
import DeleteConfirmDialog from "~/layers/core/components/DeleteConfirmDialog.vue";

definePageMeta({
  layout: "admin",
});

// Define the structure for the user stats
interface UserStats {
  totalTickets: number;
  totalProjects: number;
  ticketsByStatus: Record<string, number>;
  projectsByStatus: Record<string, number>;
}

// Define the structure for a user with stats
interface UserWithStats {
  id: string;
  name: string | null;
  email: string;
  role: string;
  emailVerified: boolean;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoggedIn: Date | null;
  company: string | null;
  avatarUrl: string | null;
  deletedAt: Date | null;
  stats: UserStats;
  recentTickets?: any[];
  recentProjects?: any[];
}

// Define the API response structure
interface ApiResponse {
  success: boolean;
  user?: UserWithStats;
  message?: string;
}

// Define the current admin user structure
interface CurrentUser {
  id: string;
  role: string;
}

const route = useRoute();
const userId = computed(() => route.params.id as string);

// Formatting composable
const { formatDate } = useFormatting();

// Fetch the user data
const { data, pending, error, refresh } = await useFetch<ApiResponse>(
  () => `/api/admin/users/${userId.value}`,
  {
    lazy: false,
    server: true,
    watch: [userId],
  }
);

// Get current user session (admin)
const { data: sessionData } = await useFetch<{ user: CurrentUser }>(
  "/api/user/profile"
);
const currentUser = computed(
  () => sessionData.value?.user || { id: "", role: "ADMIN" }
);

// Computed property for easier access to the user data
const user = computed(() => data.value?.user);

// State for edit dialog
const showEditDialog = ref(false);

// State for delete dialog
const showDeleteDialog = ref(false);
const isDeleting = ref(false);

// State for restore dialog
const showRestoreDialog = ref(false);
const isRestoring = ref(false);

const { toast } = useToast();
const router = useRouter();

// Function to handle profile update and close dialog
function handleProfileUpdated(updatedUser: any) {
  refresh(); // Refresh the main user data
  showEditDialog.value = false;
}

// Function to handle user deletion
async function deleteUser() {
  if (!user.value) return;
  
  isDeleting.value = true;
  
  try {
    const response = await $fetch(`/api/admin/users/${user.value.id}`, {
      method: 'DELETE' as any
    });
    
    if (response.success) {
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
      
      // Redirect to users list
      await router.push('/admin/users');
    }
  } catch (error: any) {
    toast({
      title: "Error",
      description: error.data?.statusMessage || "Failed to delete user",
      variant: "destructive",
    });
  } finally {
    isDeleting.value = false;
    showDeleteDialog.value = false;
  }
}

// Function to handle user restoration
async function restoreUser() {
  if (!user.value) return;
  
  isRestoring.value = true;
  
  try {
    const response = await $fetch(`/api/admin/users/${user.value.id}/restore`, {
      method: 'POST'
    });
    
    if (response.success) {
      toast({
        title: "Success",
        description: "User restored successfully",
      });
      
      // Refresh the user data
      await refresh();
      showRestoreDialog.value = false;
    }
  } catch (error: any) {
    toast({
      title: "Error",
      description: error.data?.statusMessage || "Failed to restore user",
      variant: "destructive",
    });
  } finally {
    isRestoring.value = false;
  }
}
</script>

<template>
  <div class="container py-8 max-w-7xl mx-auto">
    <!-- Header Navigation -->
    <div class="mb-8">
      <Button variant="ghost" size="sm" asChild>
        <NuxtLink to="/admin/users" class="flex items-center gap-2">
          <ArrowLeft class="w-4 h-4" />
          Back to Users
        </NuxtLink>
      </Button>
    </div>

    <!-- Loading State -->
    <div v-if="pending" class="flex flex-col items-center justify-center py-32">
      <div class="relative">
        <div class="absolute inset-0 flex items-center justify-center">
          <div class="w-20 h-20 bg-primary/10 rounded-full animate-ping"></div>
        </div>
        <Loader2 class="h-10 w-10 animate-spin text-primary relative z-10" />
      </div>
      <p class="mt-4 text-muted-foreground font-medium">Loading user details...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error || !user" class="max-w-md mx-auto mt-32">
      <Card class="border-destructive/20 bg-destructive/5">
        <CardContent class="pt-6">
          <div class="flex flex-col items-center text-center space-y-4">
            <div class="p-3 bg-destructive/10 rounded-full">
              <AlertTriangle class="h-8 w-8 text-destructive" />
            </div>
            <div>
              <p class="text-lg font-semibold text-destructive">Error Loading User</p>
              <p class="text-sm text-muted-foreground mt-1">
                {{
                  error?.data?.statusMessage ||
                  error?.data?.message ||
                  error?.message ||
                  "Could not load user data or user does not exist."
                }}
              </p>
            </div>
            <Button @click="refresh" variant="outline" size="sm">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- User Data Loaded State -->
    <div v-else class="space-y-8">
      <!-- User Header Section -->
      <div class="relative">
        <!-- Background Gradient -->
        <div class="absolute inset-0 h-32 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl"></div>
        
        <Card class="relative overflow-hidden border-0 shadow-lg">
          <CardContent class="p-0">
            <div class="flex flex-col lg:flex-row">
              <!-- Left Section: Avatar and Basic Info -->
              <div class="p-8 flex flex-col lg:flex-row items-center lg:items-start gap-6 flex-1">
                <div class="relative">
                  <div class="absolute inset-0 bg-gradient-to-br from-primary to-primary/60 rounded-full blur-xl opacity-20"></div>
                  <Avatar class="h-28 w-28 border-4 border-white shadow-xl relative">
                    <AvatarImage v-if="user.avatarUrl" :src="user.avatarUrl" />
                    <AvatarFallback
                      :class="{
                        'bg-gradient-to-br from-primary to-primary/80 text-white': hasAdminAccess(user.role),
                        'bg-gradient-to-br from-slate-500 to-slate-600 text-white': !hasAdminAccess(user.role)
                      }"
                      class="text-3xl font-bold"
                    >
                      {{
                        user.name?.charAt(0)?.toUpperCase() ||
                        user.email.charAt(0).toUpperCase()
                      }}
                    </AvatarFallback>
                  </Avatar>
                  <!-- Online Status Indicator -->
                  <div class="absolute bottom-2 right-2 h-6 w-6 bg-green-500 border-3 border-white rounded-full"></div>
                </div>

                <div class="flex-1 text-center lg:text-left space-y-4">
                  <div>
                    <h1 class="text-3xl font-bold tracking-tight">
                      {{ user.name || "Unnamed User" }}
                    </h1>
                    <p class="text-muted-foreground mt-1 flex items-center justify-center lg:justify-start gap-2">
                      <Mail class="h-4 w-4" />
                      {{ user.email }}
                    </p>
                    <p v-if="user.company" class="text-muted-foreground mt-1 flex items-center justify-center lg:justify-start gap-2">
                      <Building class="h-4 w-4" />
                      {{ user.company }}
                    </p>
                  </div>

                  <!-- Status Badges -->
                  <div class="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                    <Badge
                      :class="{
                        'bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0 px-3 py-1': user.role === 'SUPER_ADMIN',
                        'bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 px-3 py-1': user.role === 'ADMIN',
                        'bg-slate-100 text-slate-700 border-slate-200': user.role === 'CLIENT',
                      }"
                    >
                      <Shield class="h-3 w-3 mr-1" />
                      {{ user.role }}
                    </Badge>
                    
                    <Badge
                      :class="{
                        'bg-green-100 text-green-700 border-green-200': user.active,
                        'bg-red-100 text-red-700 border-red-200': !user.active,
                      }"
                    >
                      <component :is="user.active ? CheckCircle : XCircle" class="h-3 w-3 mr-1" />
                      {{ user.active ? "Active" : "Inactive" }}
                    </Badge>
                    
                    <Badge
                      :class="{
                        'bg-blue-100 text-blue-700 border-blue-200': user.emailVerified,
                        'bg-amber-100 text-amber-700 border-amber-200': !user.emailVerified,
                      }"
                    >
                      <component :is="user.emailVerified ? CheckCircle : AlertCircle" class="h-3 w-3 mr-1" />
                      {{ user.emailVerified ? "Verified" : "Unverified" }}
                    </Badge>
                    
                    <Badge
                      v-if="user.deletedAt"
                      class="bg-gray-900 text-white border-gray-900"
                    >
                      <UserX class="h-3 w-3 mr-1" />
                      Deleted
                    </Badge>
                  </div>
                </div>
              </div>

              <!-- Right Section: Quick Stats and Actions -->
              <div class="bg-muted/30 p-8 flex flex-col justify-between gap-6 lg:w-80">
                <!-- Quick Stats -->
                <div class="grid grid-cols-2 gap-4">
                  <div class="bg-white rounded-lg p-4 text-center shadow-sm">
                    <p class="text-2xl font-bold text-primary">{{ user.stats?.totalProjects || 0 }}</p>
                    <p class="text-xs text-muted-foreground">Projects</p>
                  </div>
                  <div class="bg-white rounded-lg p-4 text-center shadow-sm">
                    <p class="text-2xl font-bold text-primary">{{ user.stats?.totalTickets || 0 }}</p>
                    <p class="text-xs text-muted-foreground">Tickets</p>
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex gap-2">
                  <Dialog v-if="!user.deletedAt" v-model:open="showEditDialog">
                    <DialogTrigger asChild>
                      <Button class="flex-1" variant="default">
                        <Edit class="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    </DialogTrigger>
                    <DialogContent class="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Edit User Profile</DialogTitle>
                        <DialogDescription>
                          Make changes to the user's profile information. Click save
                          when you're done.
                        </DialogDescription>
                      </DialogHeader>
                      <EditProfileForm
                        :user="user"
                        :dialog="true"
                        @profile-updated="handleProfileUpdated"
                        @cancel="showEditDialog = false"
                      />
                    </DialogContent>
                  </Dialog>
                  
                  <Button 
                    v-if="user.deletedAt && isSuperAdmin(currentUser.role)"
                    class="flex-1"
                    variant="default"
                    @click="showRestoreDialog = true"
                  >
                    <RotateCcw class="h-4 w-4 mr-2" />
                    Restore User
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon">
                        <MoreVertical class="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Activity Log</DropdownMenuItem>
                      <DropdownMenuItem>Export Data</DropdownMenuItem>
                      <DropdownMenuSeparator v-if="isSuperAdmin(currentUser.role)" />
                      <DropdownMenuItem 
                        v-if="isSuperAdmin(currentUser.role) && user.deletedAt"
                        @click="showRestoreDialog = true"
                        class="text-green-600 focus:text-green-600"
                      >
                        Restore User
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        v-if="canDeleteUsers(currentUser.role) && !user.deletedAt"
                        @click="showDeleteDialog = true"
                        class="text-destructive focus:text-destructive"
                      >
                        Delete User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Main Content Tabs -->
      <Tabs default-value="details" class="w-full">
        <TabsList class="grid w-full grid-cols-3 h-14 p-1 bg-muted/50">
          <TabsTrigger value="details" class="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Activity class="h-4 w-4 mr-2" />
            Details
          </TabsTrigger>
          <TabsTrigger value="management" class="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Settings class="h-4 w-4 mr-2" />
            Management
          </TabsTrigger>
          <TabsTrigger value="activity" class="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Clock class="h-4 w-4 mr-2" />
            Activity
          </TabsTrigger>
        </TabsList>

          <!-- Details Tab -->
          <TabsContent value="details" class="mt-6 space-y-6">
            <!-- Stats Overview -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card class="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent class="p-6">
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-sm text-muted-foreground">Total Projects</p>
                      <p class="text-3xl font-bold mt-1">{{ user.stats?.totalProjects || 0 }}</p>
                    </div>
                    <div class="p-3 bg-primary/10 rounded-full">
                      <FolderOpen class="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card class="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent class="p-6">
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-sm text-muted-foreground">Active Projects</p>
                      <p class="text-3xl font-bold mt-1">{{ user.stats?.projectsByStatus?.IN_PROGRESS || 0 }}</p>
                    </div>
                    <div class="p-3 bg-green-100 rounded-full">
                      <Activity class="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card class="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent class="p-6">
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-sm text-muted-foreground">Support Tickets</p>
                      <p class="text-3xl font-bold mt-1">{{ user.stats?.totalTickets || 0 }}</p>
                    </div>
                    <div class="p-3 bg-blue-100 rounded-full">
                      <MessageSquare class="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card class="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent class="p-6">
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-sm text-muted-foreground">Open Tickets</p>
                      <p class="text-3xl font-bold mt-1">{{ user.stats?.ticketsByStatus?.OPEN || 0 }}</p>
                    </div>
                    <div class="p-3 bg-amber-100 rounded-full">
                      <AlertCircle class="h-6 w-6 text-amber-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <!-- User Information Card -->
            <Card class="border-0 shadow-sm">
              <CardHeader class="pb-4">
                <CardTitle class="text-lg flex items-center gap-2">
                  <UserCog class="h-5 w-5" />
                  User Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="space-y-4">
                    <div>
                      <p class="text-sm text-muted-foreground mb-1">Account Created</p>
                      <p class="font-medium flex items-center gap-2">
                        <Calendar class="h-4 w-4 text-muted-foreground" />
                        {{ formatDate(user.createdAt) }}
                      </p>
                    </div>
                    <div v-if="user.lastLoggedIn">
                      <p class="text-sm text-muted-foreground mb-1">Last Active</p>
                      <p class="font-medium flex items-center gap-2">
                        <Clock class="h-4 w-4 text-muted-foreground" />
                        {{ formatDate(user.lastLoggedIn) }}
                      </p>
                    </div>
                  </div>
                  <div class="space-y-4">
                    <div>
                      <p class="text-sm text-muted-foreground mb-1">Account Type</p>
                      <p class="font-medium">{{ user.role }}</p>
                    </div>
                    <div>
                      <p class="text-sm text-muted-foreground mb-1">User ID</p>
                      <p class="font-mono text-sm">{{ user.id }}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <!-- Detailed Stats Component -->
            <UserStats :stats="user.stats" />
          </TabsContent>

          <!-- Management Tab -->
          <TabsContent value="management" class="mt-6">
            <!-- Management Overview -->
            <div class="mb-6">
              <Card class="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardContent class="p-6">
                  <div class="flex items-center justify-between">
                    <div>
                      <h3 class="text-lg font-semibold mb-1">Account Management</h3>
                      <p class="text-sm text-muted-foreground">Manage user permissions, security settings, and account status</p>
                    </div>
                    <Settings class="h-8 w-8 text-muted-foreground/50" />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <!-- Management Cards Grid -->
            <div class="space-y-6">
              <!-- Primary Actions Row -->
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RoleManagement
                  :user="user"
                  :current-user="currentUser"
                  :on-role-changed="refresh"
                />
                <AccountStatusManagement
                  :user="user"
                  :on-status-changed="refresh"
                />
              </div>
              
              <!-- Secondary Actions Row -->
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PasswordManagement :user="user" />
                <EmailVerificationManagement
                  :user="user"
                  :on-verification-changed="refresh"
                />
              </div>
            </div>
          </TabsContent>

          <!-- Activity Tab -->
          <TabsContent value="activity" class="mt-6 space-y-6">
            <div v-if="(user.recentTickets && user.recentTickets.length > 0) || (user.recentProjects && user.recentProjects.length > 0)" class="space-y-6">
              <RecentItems
                v-if="user.recentTickets && user.recentTickets.length > 0"
                title="Recent Tickets"
                :items="user.recentTickets"
                item-type="tickets"
                view-all-link="/admin/tickets"
                class="shadow-sm"
              />
              <RecentItems
                v-if="user.recentProjects && user.recentProjects.length > 0"
                title="Recent Projects"
                :items="user.recentProjects"
                item-type="projects"
                view-all-link="/admin/projects"
                class="shadow-sm"
              />
            </div>
            
            <!-- Empty State -->
            <div
              v-else
              class="flex flex-col items-center justify-center py-16"
            >
              <div class="p-4 bg-muted/50 rounded-full mb-4">
                <Activity class="h-8 w-8 text-muted-foreground" />
              </div>
              <p class="text-lg font-medium text-muted-foreground">No Recent Activity</p>
              <p class="text-sm text-muted-foreground mt-1">This user hasn't created any projects or tickets yet.</p>
            </div>
          </TabsContent>
        </Tabs>
    </div>
    
    <!-- Delete Confirmation Dialog -->
    <DeleteConfirmDialog
      v-model:open="showDeleteDialog"
      title="Delete User"
      :description="`Are you sure you want to delete ${user?.name || user?.email}? This action cannot be undone.`"
      :item-name="user?.name || user?.email || ''"
      confirm-text="Delete User"
      :loading="isDeleting"
      @confirm="deleteUser"
    />
    
    <!-- Restore Confirmation Dialog -->
    <DeleteConfirmDialog
      v-model:open="showRestoreDialog"
      title="Restore User"
      :description="`Are you sure you want to restore ${user?.name || user?.email}? They will be able to log in again.`"
      confirm-text="Restore User"
      :loading="isRestoring"
      loading-text="Restoring..."
      variant="default"
      icon-type="restore"
      :show-warning="false"
      @confirm="restoreUser"
    />
  </div>
</template>

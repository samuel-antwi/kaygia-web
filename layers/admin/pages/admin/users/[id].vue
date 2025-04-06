<script setup lang="ts">
import { computed } from "vue";
import {
  AlertTriangle,
  ArrowLeft,
  Loader2,
  Mail,
  Building,
  Calendar,
  UserCog,
} from "lucide-vue-next";

// Import UI Components
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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

// Function to handle profile update and close dialog
function handleProfileUpdated(updatedUser: any) {
  refresh(); // Refresh the main user data
  showEditDialog.value = false;
}
</script>

<template>
  <div class="container py-6 space-y-6">
    <!-- Back Button -->
    <NuxtLink
      to="/admin/users"
      class="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
    >
      <ArrowLeft class="w-4 h-4 mr-1" />
      Back to Users
    </NuxtLink>

    <!-- Loading State -->
    <div v-if="pending" class="flex items-center justify-center py-20">
      <Loader2 class="h-10 w-10 animate-spin text-muted-foreground" />
      <p class="ml-3 text-muted-foreground">Loading user details...</p>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error || !user"
      class="p-6 bg-destructive/10 border border-destructive/20 rounded-md"
    >
      <div class="flex items-center">
        <AlertTriangle class="h-6 w-6 text-destructive mr-3" />
        <div>
          <p class="text-destructive font-semibold">Error Loading User</p>
          <p class="text-destructive/90 mt-1 text-sm">
            {{
              error?.data?.statusMessage ||
              error?.data?.message ||
              error?.message ||
              "Could not load user data or user does not exist."
            }}
          </p>
        </div>
      </div>
      <Button @click="refresh" variant="outline" size="sm" class="mt-4">
        Retry
      </Button>
    </div>

    <!-- User Data Loaded State -->
    <div v-else class="space-y-6 max-w-4xl">
      <!-- User Header Card -->
      <Card>
        <CardContent
          class="pt-6 flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6"
        >
          <Avatar class="h-24 w-24">
            <AvatarFallback
              :class="
                user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              "
              class="text-3xl"
            >
              {{
                user.name?.charAt(0)?.toUpperCase() ||
                user.email.charAt(0).toUpperCase()
              }}
            </AvatarFallback>
          </Avatar>
          <div class="flex-grow text-center md:text-left">
            <h1 class="text-2xl font-semibold">
              {{ user.name || "Unnamed User" }}
            </h1>
            <p
              class="text-muted-foreground flex items-center justify-center md:justify-start"
            >
              <Mail class="h-4 w-4 mr-1.5" />
              {{ user.email }}
            </p>
            <div
              v-if="user.company"
              class="text-muted-foreground flex items-center justify-center md:justify-start mt-1"
            >
              <Building class="h-4 w-4 mr-1.5" />
              {{ user.company }}
            </div>
            <div
              class="mt-2 flex items-center justify-center md:justify-start space-x-2"
            >
              <Badge
                variant="outline"
                :class="{
                  'bg-primary/10 text-primary border-primary/20':
                    user.role === 'ADMIN',
                  'bg-destructive/10 text-destructive border-destructive/20 font-semibold':
                    user.role === 'SUPER_ADMIN',
                  'bg-muted text-muted-foreground border-muted-foreground/20':
                    user.role === 'CLIENT',
                }"
              >
                {{ user.role }}
              </Badge>
              <Badge
                :variant="user.active ? 'default' : 'destructive'"
                :class="{
                  'bg-green-100 text-green-800 hover:bg-green-100': user.active,
                  'bg-red-100 text-red-800 hover:bg-red-100': !user.active,
                }"
              >
                {{ user.active ? "Active" : "Inactive" }}
              </Badge>
              <Badge
                :variant="user.emailVerified ? 'default' : 'outline'"
                :class="{
                  'bg-green-100 text-green-800 hover:bg-green-100':
                    user.emailVerified,
                  'bg-orange-100 text-orange-800 hover:bg-orange-100':
                    !user.emailVerified,
                }"
              >
                {{ user.emailVerified ? "Verified" : "Not Verified" }}
              </Badge>
            </div>
          </div>
          <Dialog v-model:open="showEditDialog">
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                class="flex items-center gap-1.5 shrink-0 mt-4 md:mt-0"
              >
                <UserCog class="h-4 w-4" />
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
        </CardContent>
      </Card>

      <!-- Tabs -->
      <div class="max-w-4xl">
        <Tabs default-value="details" class="w-full">
          <TabsList class="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="management">Management</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <!-- Details Tab -->
          <TabsContent value="details" class="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>User Details & Statistics</CardTitle>
              </CardHeader>
              <CardContent class="space-y-6">
                <!-- User Stats -->
                <UserStats :stats="user.stats" />
                <Separator />
                <!-- Additional Details -->
                <div class="text-sm space-y-2">
                  <div class="flex items-center">
                    <Calendar class="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Joined: {{ formatDate(user.createdAt) }}</span>
                  </div>
                  <div v-if="user.lastLoggedIn" class="flex items-center">
                    <span class="h-4 w-4 mr-2 text-muted-foreground">🕒</span>
                    <span>Last Login: {{ formatDate(user.lastLoggedIn) }}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <!-- Management Tab -->
          <TabsContent value="management" class="mt-4 space-y-4">
            <RoleManagement
              :user="user"
              :current-user="currentUser"
              :on-role-changed="refresh"
            />
            <AccountStatusManagement
              :user="user"
              :on-status-changed="refresh"
            />
            <PasswordManagement :user="user" />
            <EmailVerificationManagement
              :user="user"
              :on-verification-changed="refresh"
            />
          </TabsContent>

          <!-- Activity Tab -->
          <TabsContent value="activity" class="mt-4 space-y-4">
            <RecentItems
              v-if="user.recentTickets && user.recentTickets.length > 0"
              title="Recent Tickets"
              :items="user.recentTickets"
              item-type="tickets"
              view-all-link="/admin/tickets"
            />
            <RecentItems
              v-if="user.recentProjects && user.recentProjects.length > 0"
              title="Recent Projects"
              :items="user.recentProjects"
              item-type="projects"
              view-all-link="/admin/projects"
            />
            <Card
              v-if="
                (!user.recentTickets || user.recentTickets.length === 0) &&
                (!user.recentProjects || user.recentProjects.length === 0)
              "
            >
              <CardContent class="pt-6 text-center text-muted-foreground">
                No recent activity found for this user.
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  </div>
</template>

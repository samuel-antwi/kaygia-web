<script setup lang="ts">
import { ref, computed } from "vue";
import { useToast } from "@/components/ui/toast/use-toast";
import {
  AlertTriangle,
  ArrowLeft,
  Loader2,
  UserCog,
  TicketIcon,
  LayoutList,
  Calendar,
  Mail,
  Building,
  ShieldCheck,
  ShieldAlert,
} from "lucide-vue-next";

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

const route = useRoute();
const userId = computed(() => route.params.id as string);
const { toast } = useToast();
const isChangingRole = ref(false);

// Fetch the user data
const { data, pending, error, refresh } = await useFetch<ApiResponse>(
  () => `/api/admin/users/${userId.value}`,
  {
    lazy: false,
    server: true,
    watch: [userId],
  }
);

// Computed property for easier access to the user data
const user = computed(() => data.value?.user);

// Computed property to get project status entries with values > 0
const projectStatusEntries = computed(() => {
  if (!user.value?.stats?.projectsByStatus) return [];

  return Object.entries(user.value.stats.projectsByStatus)
    .filter(([_, count]) => count > 0)
    .map(([status, count]) => ({ status, count }));
});

// Function to format date
const formatDate = (dateString: string | Date | null | undefined): string => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// Function to change user role
const changeUserRole = async (newRole: string) => {
  if (!user.value || isChangingRole.value) return;

  // Don't do anything if trying to set the same role
  if (user.value.role === newRole) return;

  isChangingRole.value = true;

  try {
    const response = await $fetch<{ success: boolean; message?: string }>(
      `/api/admin/users/${userId.value}/role`,
      {
        method: "PUT",
        body: { role: newRole },
      }
    );

    if (response.success) {
      await refresh();
      toast({
        title: "Role Updated",
        description: `User ${user.value.name || user.value.email} is now an ${newRole}`,
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

// Get ticket status color
const getTicketStatusColor = (status: string) => {
  switch (status) {
    case "OPEN":
      return "text-blue-600";
    case "PENDING":
      return "text-amber-600";
    case "RESOLVED":
      return "text-cyan-600";
    case "CLOSED":
      return "text-green-600";
    default:
      return "text-gray-600";
  }
};

// Get project status color
const getProjectStatusColor = (status: string) => {
  switch (status) {
    case "PENDING":
      return "text-amber-600";
    case "APPROVED":
      return "text-blue-600";
    case "IN_PROGRESS":
      return "text-purple-600";
    case "REVIEW":
      return "text-cyan-600";
    case "COMPLETED":
      return "text-green-600";
    case "CANCELLED":
      return "text-red-600";
    default:
      return "text-gray-600";
  }
};
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
      v-else-if="error"
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
              "Could not load user data."
            }}
          </p>
        </div>
      </div>
      <Button @click="refresh" variant="outline" size="sm" class="mt-4">
        Retry
      </Button>
    </div>

    <!-- No User Data State -->
    <div
      v-else-if="!user"
      class="text-center py-10 border border-dashed rounded-md"
    >
      <p class="text-muted-foreground">
        User data could not be loaded or does not exist.
      </p>
      <Button @click="refresh" variant="outline" size="sm" class="mt-3">
        Retry
      </Button>
    </div>

    <!-- User Data Loaded State -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left Column: User Profile -->
      <div class="lg:col-span-1 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>User Profile</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="flex flex-col items-center">
              <Avatar class="h-24 w-24 mb-4">
                <AvatarFallback
                  :class="
                    user.role === 'ADMIN'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  "
                  class="text-2xl"
                >
                  {{
                    user.name?.charAt(0)?.toUpperCase() ||
                    user.email.charAt(0).toUpperCase()
                  }}
                </AvatarFallback>
              </Avatar>
              <h2 class="text-xl font-semibold">
                {{ user.name || "Unnamed User" }}
              </h2>
              <Badge
                variant="outline"
                :class="
                  user.role === 'ADMIN'
                    ? 'bg-primary/10 text-primary border-primary/20'
                    : 'bg-muted text-muted-foreground border-muted-foreground/20'
                "
              >
                {{ user.role }}
              </Badge>
            </div>

            <Separator />

            <div class="space-y-2">
              <div class="flex items-center text-sm">
                <Mail class="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{{ user.email }}</span>
              </div>
              <div v-if="user.company" class="flex items-center text-sm">
                <Building class="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{{ user.company }}</span>
              </div>
              <div class="flex items-center text-sm">
                <Calendar class="h-4 w-4 mr-2 text-muted-foreground" />
                <span>Joined {{ formatDate(user.createdAt) }}</span>
              </div>
              <div class="flex items-center text-sm">
                <Badge
                  :variant="user.emailVerified ? 'default' : 'outline'"
                  :class="
                    user.emailVerified
                      ? 'bg-green-100 text-green-800 hover:bg-green-100'
                      : 'bg-orange-100 text-orange-800 hover:bg-orange-100'
                  "
                >
                  {{
                    user.emailVerified ? "Email Verified" : "Email Not Verified"
                  }}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Change Role Card -->
        <Card>
          <CardHeader>
            <CardTitle>Role Management</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <p class="text-sm text-muted-foreground mb-2">
              Change user's role in the system:
            </p>

            <div class="relative space-y-2">
              <Button
                variant="outline"
                size="sm"
                class="w-full flex items-center justify-between"
                :class="{ 'opacity-50': isChangingRole }"
                :disabled="isChangingRole || user.role === 'CLIENT'"
                @click="changeUserRole('CLIENT')"
              >
                <div class="flex items-center">
                  <UserCog class="h-4 w-4 mr-2" />
                  <span>Set as CLIENT</span>
                </div>
                <span v-if="user.role === 'CLIENT'"> (Current) </span>
              </Button>

              <Button
                variant="default"
                size="sm"
                class="w-full flex items-center justify-between"
                :class="{ 'opacity-50': isChangingRole }"
                :disabled="isChangingRole || user.role === 'ADMIN'"
                @click="changeUserRole('ADMIN')"
              >
                <div class="flex items-center">
                  <ShieldCheck class="h-4 w-4 mr-2" />
                  <span>Set as ADMIN</span>
                </div>
                <span v-if="user.role === 'ADMIN'"> (Current) </span>
              </Button>

              <!-- Loading spinner overlay -->
              <div
                v-if="isChangingRole"
                class="absolute inset-0 flex items-center justify-center bg-background/50 rounded"
              >
                <Loader2 class="h-4 w-4 animate-spin" />
              </div>
            </div>

            <Alert class="mt-2" variant="destructive">
              <AlertTriangle class="h-4 w-4" />
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                Changing a user's role affects their permissions and access
                across the system.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>

      <!-- Right Column: Activity and Stats -->
      <div class="lg:col-span-2 space-y-4">
        <!-- Stats Overview -->
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Tickets Card -->
              <Card>
                <CardHeader class="pb-2">
                  <div class="flex items-center justify-between">
                    <CardTitle class="text-sm font-medium"
                      >Total Tickets</CardTitle
                    >
                    <TicketIcon class="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div class="text-2xl font-bold">
                    {{ user.stats.totalTickets }}
                  </div>
                  <div class="text-xs text-muted-foreground mt-1">
                    Tickets by status
                  </div>
                  <div class="flex flex-wrap gap-2 mt-2">
                    <div
                      v-for="(count, status) in user.stats.ticketsByStatus"
                      :key="status"
                      class="text-xs flex items-center gap-1"
                      :class="getTicketStatusColor(status)"
                    >
                      <span>{{ status }}:</span>
                      <span class="font-semibold">{{ count }}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <!-- Projects Card -->
              <Card>
                <CardHeader class="pb-2">
                  <div class="flex items-center justify-between">
                    <CardTitle class="text-sm font-medium"
                      >Total Projects</CardTitle
                    >
                    <LayoutList class="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div class="text-2xl font-bold">
                    {{ user.stats.totalProjects }}
                  </div>
                  <div class="text-xs text-muted-foreground mt-1">
                    Projects by status
                  </div>
                  <div class="flex flex-wrap gap-2 mt-2">
                    <div
                      v-for="item in projectStatusEntries"
                      :key="item.status"
                      class="text-xs flex items-center gap-1"
                      :class="getProjectStatusColor(item.status)"
                    >
                      <span>{{ item.status }}:</span>
                      <span class="font-semibold">{{ item.count }}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        <!-- Recent Tickets -->
        <Card v-if="user.recentTickets && user.recentTickets.length > 0">
          <CardHeader>
            <CardTitle>Recent Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="ticket in user.recentTickets" :key="ticket.id">
                  <TableCell class="font-medium">{{
                    ticket.subject
                  }}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      :class="getTicketStatusColor(ticket.status)"
                    >
                      {{ ticket.status }}
                    </Badge>
                  </TableCell>
                  <TableCell>{{ formatDate(ticket.createdAt) }}</TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <div class="mt-4 flex justify-center">
              <NuxtLink to="/admin/tickets">
                <Button variant="outline" size="sm">View All Tickets</Button>
              </NuxtLink>
            </div>
          </CardContent>
        </Card>

        <!-- Recent Projects -->
        <Card v-if="user.recentProjects && user.recentProjects.length > 0">
          <CardHeader>
            <CardTitle>Recent Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow
                  v-for="project in user.recentProjects"
                  :key="project.id"
                >
                  <TableCell class="font-medium">{{ project.title }}</TableCell>
                  <TableCell>{{ project.type }}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      :class="getProjectStatusColor(project.status)"
                    >
                      {{ project.status }}
                    </Badge>
                  </TableCell>
                  <TableCell>{{ formatDate(project.createdAt) }}</TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <div class="mt-4 flex justify-center">
              <NuxtLink to="/admin/projects">
                <Button variant="outline" size="sm">View All Projects</Button>
              </NuxtLink>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watchEffect, ref } from "vue";
import { Role } from "../../types/role";
import { hasAdminAccess } from "../../utils/adminAccess";
import {
  Ticket,
  Users,
  FolderKanban,
  Clock,
  ArrowRight,
  AlertTriangle,
  Loader2,
} from "lucide-vue-next";

// Ensure middleware runs for this page (it does if global)
definePageMeta({
  layout: "admin",
});

const { user, loading } = useAuth();
const router = useRouter();

// Define interfaces
interface DashboardStats {
  tickets: {
    total: number;
    open: number;
  };
  users: {
    total: number;
    newThisMonth: number;
  };
  projects: {
    total: number;
    inProgress: number;
  };
}

interface RecentActivity {
  id: string;
  type: "ticket" | "user" | "project";
  action: string;
  subject: string;
  date: string;
  link: string;
}

// State variables
const isLoadingStats = ref(true);
const isLoadingActivity = ref(true);
const stats = ref<DashboardStats>({
  tickets: { total: 0, open: 0 },
  users: { total: 0, newThisMonth: 0 },
  projects: { total: 0, inProgress: 0 },
});
const recentActivity = ref<RecentActivity[]>([]);

// Fetch dashboard stats
const fetchDashboardData = async () => {
  isLoadingStats.value = true;
  try {
    const { data: statsData } = await useFetch<{ stats: DashboardStats }>(
      "/api/admin/dashboard/stats"
    );
    if (statsData.value?.stats) {
      stats.value = statsData.value.stats;
    }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
  } finally {
    isLoadingStats.value = false;
  }
};

// Fetch recent activity
const fetchRecentActivity = async () => {
  isLoadingActivity.value = true;
  try {
    const { data: activityData } = await useFetch<{
      activities: RecentActivity[];
    }>("/api/admin/dashboard/activity");
    if (activityData.value?.activities) {
      recentActivity.value = activityData.value.activities;
    }
  } catch (error) {
    console.error("Error fetching recent activity:", error);
  } finally {
    isLoadingActivity.value = false;
  }
};

// Format date helper
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

// Watch auth state for role check after loading
watchEffect(() => {
  if (!loading.value && user.value) {
    if (!hasAdminAccess(user.value.role)) {
      console.warn("[Admin Page Watcher] Role check FAILED. Redirecting...");
      router.push("/dashboard?error=unauthorized");
    } else {
      // If user is admin, fetch dashboard data
      fetchDashboardData();
      fetchRecentActivity();
    }
  } else if (!loading.value && !user.value) {
    router.push("/auth/login?redirect=/admin");
  }
});
</script>

<template>
  <div>
    <!-- Show loading state while auth is resolving -->
    <div v-if="loading" class="flex justify-center items-center min-h-[400px]">
      <Loader2 class="h-8 w-8 animate-spin" />
      <span class="sr-only">Loading user data...</span>
    </div>

    <!-- Only show content if user is loaded and confirmed ADMIN -->
    <div v-else-if="user && hasAdminAccess(user.role)" class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-3xl font-bold">Admin Dashboard</h1>
        <div class="flex items-center gap-2">
          <span class="text-sm text-muted-foreground"
            >Welcome, {{ user.name }}</span
          >
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <!-- Tickets Card -->
        <Card>
          <CardHeader
            class="flex flex-row items-center justify-between space-y-0 pb-2"
          >
            <CardTitle class="text-sm font-medium">Total Tickets</CardTitle>
            <Ticket class="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">
              <div
                v-if="isLoadingStats"
                class="h-8 w-16 rounded bg-muted animate-pulse"
              ></div>
              <div v-else>{{ stats.tickets.total }}</div>
            </div>
            <p class="text-xs text-muted-foreground pt-1">
              <span v-if="!isLoadingStats" class="font-medium text-primary">{{
                stats.tickets.open
              }}</span>
              <span
                v-else
                class="h-4 w-8 rounded bg-muted animate-pulse inline-block"
              ></span>
              open tickets requiring attention
            </p>
          </CardContent>
          <CardFooter class="p-2">
            <NuxtLink
              to="/admin/tickets"
              class="text-xs text-primary flex items-center hover:underline"
            >
              View all tickets
              <ArrowRight class="ml-1 h-3 w-3" />
            </NuxtLink>
          </CardFooter>
        </Card>

        <!-- Users Card -->
        <Card>
          <CardHeader
            class="flex flex-row items-center justify-between space-y-0 pb-2"
          >
            <CardTitle class="text-sm font-medium">Total Users</CardTitle>
            <Users class="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">
              <div
                v-if="isLoadingStats"
                class="h-8 w-16 rounded bg-muted animate-pulse"
              ></div>
              <div v-else>{{ stats.users.total }}</div>
            </div>
            <p class="text-xs text-muted-foreground pt-1">
              <span v-if="!isLoadingStats" class="font-medium text-primary">{{
                stats.users.newThisMonth
              }}</span>
              <span
                v-else
                class="h-4 w-8 rounded bg-muted animate-pulse inline-block"
              ></span>
              new users this month
            </p>
          </CardContent>
          <CardFooter class="p-2">
            <NuxtLink
              to="/admin/users"
              class="text-xs text-primary flex items-center hover:underline"
            >
              Manage users
              <ArrowRight class="ml-1 h-3 w-3" />
            </NuxtLink>
          </CardFooter>
        </Card>

        <!-- Projects Card -->
        <Card>
          <CardHeader
            class="flex flex-row items-center justify-between space-y-0 pb-2"
          >
            <CardTitle class="text-sm font-medium">Total Projects</CardTitle>
            <FolderKanban class="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">
              <div
                v-if="isLoadingStats"
                class="h-8 w-16 rounded bg-muted animate-pulse"
              ></div>
              <div v-else>{{ stats.projects.total }}</div>
            </div>
            <p class="text-xs text-muted-foreground pt-1">
              <span v-if="!isLoadingStats" class="font-medium text-primary">{{
                stats.projects.inProgress
              }}</span>
              <span
                v-else
                class="h-4 w-8 rounded bg-muted animate-pulse inline-block"
              ></span>
              projects in progress
            </p>
          </CardContent>
          <CardFooter class="p-2">
            <NuxtLink
              to="/admin/projects"
              class="text-xs text-primary flex items-center hover:underline"
            >
              View all projects
              <ArrowRight class="ml-1 h-3 w-3" />
            </NuxtLink>
          </CardFooter>
        </Card>
      </div>

      <!-- Recent Activity -->
      <div class="space-y-4">
        <div class="flex items-center">
          <h2 class="text-xl font-semibold">Recent Activity</h2>
          <Badge variant="outline" class="ml-2">
            <Clock class="h-3 w-3 mr-1" />
            Last 7 days
          </Badge>
        </div>

        <div v-if="isLoadingActivity" class="space-y-2">
          <div
            v-for="i in 5"
            :key="i"
            class="h-16 rounded bg-muted animate-pulse"
          ></div>
        </div>

        <Card v-else-if="recentActivity.length > 0">
          <CardContent class="p-0">
            <div class="divide-y">
              <div
                v-for="activity in recentActivity"
                :key="activity.id"
                class="p-4 flex items-center justify-between"
              >
                <div class="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    class="h-8 w-8 rounded-full p-0 flex items-center justify-center"
                  >
                    <Ticket v-if="activity.type === 'ticket'" class="h-4 w-4" />
                    <Users
                      v-else-if="activity.type === 'user'"
                      class="h-4 w-4"
                    />
                    <FolderKanban v-else class="h-4 w-4" />
                  </Badge>
                  <div>
                    <p class="text-sm">
                      <span class="font-medium">{{ activity.action }}</span>
                      {{ activity.subject }}
                    </p>
                    <p class="text-xs text-muted-foreground">
                      {{ formatDate(activity.date) }}
                    </p>
                  </div>
                </div>
                <NuxtLink
                  :to="activity.link"
                  class="text-xs text-primary hover:underline"
                >
                  View
                </NuxtLink>
              </div>
            </div>
          </CardContent>
        </Card>

        <div v-else class="rounded-lg border p-8 text-center">
          <div
            class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted"
          >
            <Clock class="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 class="mt-4 text-lg font-semibold">No recent activity</h3>
          <p class="mt-2 text-sm text-muted-foreground">
            When you start using the admin panel, your recent activities will be
            displayed here.
          </p>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold">Quick Actions</h2>
        <div class="grid gap-4 md:grid-cols-3">
          <Card
            class="cursor-pointer hover:bg-muted/50 transition-colors"
            @click="router.push('/admin/tickets')"
          >
            <CardContent
              class="p-6 flex flex-col items-center justify-center text-center space-y-2"
            >
              <div class="bg-primary/10 p-3 rounded-full">
                <Ticket class="h-6 w-6 text-primary" />
              </div>
              <CardTitle class="text-base">View Open Tickets</CardTitle>
              <p class="text-xs text-muted-foreground">
                Manage support tickets
              </p>
            </CardContent>
          </Card>

          <Card
            class="cursor-pointer hover:bg-muted/50 transition-colors"
            @click="router.push('/admin/users')"
          >
            <CardContent
              class="p-6 flex flex-col items-center justify-center text-center space-y-2"
            >
              <div class="bg-primary/10 p-3 rounded-full">
                <Users class="h-6 w-6 text-primary" />
              </div>
              <CardTitle class="text-base">Manage Users</CardTitle>
              <p class="text-xs text-muted-foreground">
                Update roles and profiles
              </p>
            </CardContent>
          </Card>

          <Card
            class="cursor-pointer hover:bg-muted/50 transition-colors"
            @click="router.push('/admin/projects')"
          >
            <CardContent
              class="p-6 flex flex-col items-center justify-center text-center space-y-2"
            >
              <div class="bg-primary/10 p-3 rounded-full">
                <FolderKanban class="h-6 w-6 text-primary" />
              </div>
              <CardTitle class="text-base">View Projects</CardTitle>
              <p class="text-xs text-muted-foreground">
                Track project progress
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>

    <!-- Optional: Show an unauthorized message if somehow the redirect didn't happen -->
    <div
      v-else
      class="p-6 bg-destructive/10 rounded-md border border-destructive"
    >
      <div class="flex items-center gap-3">
        <AlertTriangle class="h-5 w-5 text-destructive" />
        <h3 class="font-medium text-destructive">Access Denied</h3>
      </div>
      <p class="text-sm mt-2">
        You don't have permission to view this page. Redirecting...
      </p>
    </div>
  </div>
</template>

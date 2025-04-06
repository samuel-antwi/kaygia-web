<script setup lang="ts">
import {
  Briefcase,
  CheckCircle,
  MessageCircle,
  Receipt,
  Eye,
  File,
  FilePlus,
  MessageSquare,
  Clock,
  Bell,
  Calendar,
} from "lucide-vue-next";
import { useProjectStore } from "~/layers/dashboard/stores/projectStore";
import type { ProjectStatus } from "../../types/project";

definePageMeta({
  layout: "dashboard",
  middleware: "auth",
});

// Initialize project store
const projectStore = useProjectStore();
const { projects, isLoading } = storeToRefs(projectStore);

// Auth store for user information
const { user, loading: authLoading } = useAuth();

// Load projects on mount
onMounted(async () => {
  await projectStore.fetchProjects();
});

// Get recent projects (limited to 3)
const recentProjects = computed(() => {
  return projects.value.slice(0, 3);
});

// Status badge styles
const getStatusClass = (status: ProjectStatus): string => {
  const statusStyles: Record<ProjectStatus, string> = {
    PENDING:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500",
    APPROVED:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500",
    IN_PROGRESS:
      "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-500",
    REVIEW:
      "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-500",
    COMPLETED:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500",
    CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500",
  };

  return statusStyles[status] || "";
};

// Format status for display
const formatStatus = (status: string): string => {
  return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

// Calculate progress based on status
const calculateProgress = (status: ProjectStatus): number => {
  const progressMap: Record<ProjectStatus, number> = {
    PENDING: 0,
    APPROVED: 20,
    IN_PROGRESS: 50,
    REVIEW: 80,
    COMPLETED: 100,
    CANCELLED: 0,
  };

  return progressMap[status] || 0;
};

// Project statistics
const stats = computed(() => [
  {
    title: "Active Projects",
    value: projects.value.filter((p) =>
      ["APPROVED", "IN_PROGRESS", "REVIEW"].includes(p.status)
    ).length,
    icon: Briefcase,
  },
  {
    title: "Completed Projects",
    value: projects.value.filter((p) => p.status === "COMPLETED").length,
    icon: CheckCircle,
  },
  {
    title: "Pending Projects",
    value: projects.value.filter((p) => p.status === "PENDING").length,
    icon: Clock,
  },
  {
    title: "Total Projects",
    value: projects.value.length,
    icon: Receipt,
  },
]);
</script>
<template>
  <div>
    <div class="mb-6">
      <h2 class="text-2xl sm:text-3xl font-bold mb-2">
        <span v-if="authLoading">Welcome back!</span>
        <span v-else>Welcome back, {{ user?.name || "Client" }}!</span>
      </h2>
      <p class="text-muted-foreground">
        Here's an overview of your projects and activities.
      </p>
    </div>
    <!-- Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
      <Card v-for="stat in stats" :key="stat.title" class="flex items-center">
        <CardContent
          class="flex p-3 sm:py-6 sm:px-4 items-center gap-2 sm:gap-4"
        >
          <div
            class="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary/10 flex items-center justify-center"
          >
            <component
              :is="stat.icon"
              class="h-5 w-5 sm:h-6 sm:w-6 text-primary"
            />
          </div>
          <div>
            <p class="text-xs sm:text-sm text-muted-foreground">
              {{ stat.title }}
            </p>
            <p class="text-xl sm:text-2xl font-bold">{{ stat.value }}</p>
          </div>
        </CardContent>
      </Card>
    </div>
    <!-- Recent Projects -->
    <Card class="mb-6 sm:mb-8 overflow-hidden">
      <CardHeader>
        <CardTitle>Recent Projects</CardTitle>
        <CardDescription
          >Monitor your ongoing and recent project activities.</CardDescription
        >
      </CardHeader>
      <CardContent class="px-0 sm:px-6 overflow-x-auto">
        <div class="min-w-[650px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead class="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-if="isLoading">
                <TableCell colspan="6" class="text-center py-8">
                  <div class="flex justify-center">
                    <div
                      class="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"
                    ></div>
                  </div>
                  <p class="mt-2 text-muted-foreground">Loading projects...</p>
                </TableCell>
              </TableRow>
              <TableRow v-else-if="!isLoading && recentProjects.length === 0">
                <TableCell colspan="6" class="text-center py-8">
                  <div class="flex flex-col items-center">
                    <File class="h-10 w-10 text-muted-foreground mb-2" />
                    <p class="text-muted-foreground">No projects found.</p>
                    <Button variant="outline" class="mt-4" as-child>
                      <NuxtLink to="/dashboard/projects/new"
                        >Create your first project</NuxtLink
                      >
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow
                v-for="project in recentProjects"
                :key="project.id"
                v-else
              >
                <TableCell class="font-medium">{{ project.title }}</TableCell>
                <TableCell>
                  <Badge :class="getStatusClass(project.status)">
                    {{ formatStatus(project.status) }}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div class="flex items-center gap-2">
                    <Progress
                      :value="calculateProgress(project.status)"
                      class="w-[60px] sm:w-[80px]"
                    />
                    <span class="text-xs"
                      >{{ calculateProgress(project.status) }}%</span
                    >
                  </div>
                </TableCell>
                <TableCell>{{ formatStatus(project.type) }}</TableCell>
                <TableCell>{{
                  new Date(project.updatedAt).toLocaleDateString()
                }}</TableCell>
                <TableCell class="text-right">
                  <Button variant="ghost" size="icon" as-child>
                    <NuxtLink :to="`/dashboard/projects/${project.id}`">
                      <Eye class="h-4 w-4" />
                      <span class="sr-only">View Project</span>
                    </NuxtLink>
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" as-child class="ml-auto">
          <NuxtLink to="/dashboard/projects">View All Projects</NuxtLink>
        </Button>
      </CardFooter>
    </Card>
    <!-- Activity and Notifications -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
      <!-- Recent Activity -->
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates on your projects.</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="space-y-4 sm:space-y-6">
            <div v-if="isLoading" class="text-center py-4">
              <div class="flex justify-center mb-2">
                <div
                  class="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"
                ></div>
              </div>
              <p class="text-muted-foreground">Loading activity...</p>
            </div>
            <div
              v-else-if="recentProjects.length > 0"
              class="flex items-start gap-3 sm:gap-4"
            >
              <Avatar class="mt-1 h-8 w-8 sm:h-10 sm:w-10">
                <AvatarImage src="" alt="" />
                <AvatarFallback class="bg-primary/10 text-primary">
                  <CheckCircle class="h-3 w-3 sm:h-4 sm:w-4" />
                </AvatarFallback>
              </Avatar>
              <div>
                <p class="text-sm font-medium">Project Update</p>
                <p class="text-xs sm:text-sm text-muted-foreground">
                  Your "{{ recentProjects[0].title }}" project status is
                  {{ formatStatus(recentProjects[0].status) }}.
                </p>
                <p class="text-xs text-muted-foreground mt-1">
                  {{
                    new Date(recentProjects[0].updatedAt).toLocaleDateString()
                  }}
                </p>
              </div>
            </div>
            <div v-else class="text-center py-4">
              <p class="text-muted-foreground">No recent activity.</p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" class="w-full" as-child>
            <NuxtLink to="/dashboard/projects">View All Projects</NuxtLink>
          </Button>
        </CardFooter>
      </Card>
      <!-- Quick Actions -->
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts.</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="grid gap-2">
            <Button variant="outline" class="w-full justify-start" as-child>
              <NuxtLink to="/dashboard/projects/new" class="flex items-center">
                <FilePlus class="mr-2 h-4 w-4" />
                Create New Project
              </NuxtLink>
            </Button>
            <Button variant="outline" class="w-full justify-start" as-child>
              <NuxtLink to="/dashboard/projects" class="flex items-center">
                <Briefcase class="mr-2 h-4 w-4" />
                View All Projects
              </NuxtLink>
            </Button>
            <Button variant="outline" class="w-full justify-start" as-child>
              <NuxtLink to="/contact" class="flex items-center">
                <MessageSquare class="mr-2 h-4 w-4" />
                Contact Support
              </NuxtLink>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

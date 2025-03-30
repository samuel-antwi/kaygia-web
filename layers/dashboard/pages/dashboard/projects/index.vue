<script setup lang="ts">
import { RefreshCw, Plus, Filter, Eye, FileText } from "lucide-vue-next";
import { useProjectStore } from "~/layers/dashboard/stores/projectStore";
import type { ProjectStatus } from "../../../types/project";

definePageMeta({
  layout: "dashboard",
  middleware: "auth",
});

// Initialize the project store
const projectStore = useProjectStore();
const { projects, isLoading, error } = storeToRefs(projectStore);

// Status filter
const statusFilter = ref<ProjectStatus | "ALL">("ALL");
const statusOptions = [
  { value: "ALL", label: "All Projects" },
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "REVIEW", label: "In Review" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

// Search term
const searchTerm = ref("");

// Computed filtered projects
const filteredProjects = computed(() => {
  let filtered = projects.value;

  // Apply status filter
  if (statusFilter.value !== "ALL") {
    filtered = filtered.filter(
      (project) => project.status === statusFilter.value
    );
  }

  // Apply search filter (case insensitive)
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase();
    filtered = filtered.filter(
      (project) =>
        project.title.toLowerCase().includes(term) ||
        (project.description &&
          project.description.toLowerCase().includes(term))
    );
  }

  return filtered;
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

// Load projects on component mount
onMounted(async () => {
  await projectStore.fetchProjects();
});

// Handle refresh button
const refreshProjects = async () => {
  await projectStore.fetchProjects();
};
</script>

<template>
  <div>
    <div class="flex flex-col md:flex-row md:items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl sm:text-3xl font-bold mb-2">My Projects</h2>
        <p class="text-muted-foreground">
          Manage and track all your projects in one place.
        </p>
      </div>
      <div class="mt-4 md:mt-0 flex space-x-2">
        <Button
          @click="refreshProjects"
          variant="outline"
          size="icon"
          class="h-9 w-9"
        >
          <RefreshCw class="h-4 w-4" />
        </Button>
        <Button as-child>
          <NuxtLink to="/dashboard/projects/new" class="flex items-center">
            <Plus class="mr-2 h-4 w-4" />
            New Project
          </NuxtLink>
        </Button>
      </div>
    </div>

    <!-- Search and filters -->
    <div class="bg-card border rounded-lg p-4 mb-6">
      <div class="flex flex-col md:flex-row gap-4">
        <div class="flex-1">
          <Input
            v-model="searchTerm"
            placeholder="Search projects..."
            class="w-full"
          />
        </div>
        <div class="flex space-x-2">
          <Select v-model="statusFilter">
            <SelectTrigger class="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Status</SelectLabel>
                <SelectItem
                  v-for="option in statusOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>

    <!-- Projects table -->
    <Card class="overflow-hidden">
      <CardHeader>
        <CardTitle>All Projects</CardTitle>
        <CardDescription>
          {{ filteredProjects.length }} projects found.
        </CardDescription>
      </CardHeader>
      <CardContent class="p-0 sm:px-6">
        <div class="min-w-[650px] overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Updated</TableHead>
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
              <TableRow v-else-if="error">
                <TableCell
                  colspan="6"
                  class="text-center py-8 text-destructive"
                >
                  {{ error }}
                </TableCell>
              </TableRow>
              <TableRow v-else-if="filteredProjects.length === 0">
                <TableCell colspan="6" class="text-center py-8">
                  <div class="flex flex-col items-center">
                    <FileText class="h-10 w-10 text-muted-foreground mb-2" />
                    <p class="text-muted-foreground">No projects found.</p>
                    <Button variant="outline" class="mt-4" as-child>
                      <NuxtLink to="/dashboard/projects/new"
                        >Create a new project</NuxtLink
                      >
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow v-for="project in filteredProjects" :key="project.id">
                <TableCell class="font-medium">{{ project.title }}</TableCell>
                <TableCell>
                  <Badge :class="getStatusClass(project.status)">
                    {{ formatStatus(project.status) }}
                  </Badge>
                </TableCell>
                <TableCell>{{ formatStatus(project.type) }}</TableCell>
                <TableCell>{{
                  new Date(project.createdAt).toLocaleDateString()
                }}</TableCell>
                <TableCell>{{
                  new Date(project.updatedAt).toLocaleDateString()
                }}</TableCell>
                <TableCell class="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    as-child
                    title="View Project"
                  >
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
    </Card>
  </div>
</template>

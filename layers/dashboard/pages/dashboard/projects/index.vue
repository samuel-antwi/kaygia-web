<script setup lang="ts">
import { Plus, Eye, FileText, Search } from "lucide-vue-next";
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
</script>

<template>
  <div>
    <div class="flex flex-col md:flex-row md:items-center gap-4 mb-6">
      <!-- Left side: Title and Description -->
      <div class="flex-1">
        <h2 class="text-2xl sm:text-3xl font-bold mb-2">My Projects</h2>
        <p class="text-muted-foreground text-sm">
          Manage and track all your projects.
        </p>
      </div>

      <!-- Right side: Search, Filter, Actions -->
      <div class="flex flex-col md:flex-row md:items-center gap-2">
        <!-- Search Input -->
        <div class="relative md:w-64 bg-white">
          <Search
            class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
          />
          <Input
            v-model="searchTerm"
            placeholder="Search projects..."
            class="w-full pl-10 h-9"
          />
        </div>

        <!-- Filter Select -->
        <Select v-model="statusFilter">
          <SelectTrigger class="w-full md:w-[180px] bg-white h-9">
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

        <!-- New Project Button -->
        <Button as-child class="h-9 flex-shrink-0">
          <NuxtLink to="/dashboard/projects/new" class="flex items-center">
            <Plus class="mr-2 h-4 w-4" />
            New Project
          </NuxtLink>
        </Button>
      </div>
    </div>

    <!-- Projects table -->
    <Card class="overflow-hidden">
      <CardHeader>
        <CardTitle>{{
          statusOptions.find((option) => option.value === statusFilter)
            ?.label || "All Projects"
        }}</CardTitle>
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

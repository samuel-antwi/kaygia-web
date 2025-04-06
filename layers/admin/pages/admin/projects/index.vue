<script setup lang="ts">
import { ref, computed } from "vue";
import { AlertTriangle, Loader2, Search, FolderKanban } from "lucide-vue-next";
import type { InferSelectModel } from "drizzle-orm";
import type { projects as projectsSchema } from "~/server/db/schema";

// First let's check if the composable exists
// If not, we'll define the formatting functions inline
const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return "N/A";
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

definePageMeta({
  layout: "admin",
});

// Define the project type with client details
interface AdminProject {
  id: string;
  title: string;
  description: string | null;
  status: string;
  clientId: string;
  createdAt: Date;
  updatedAt: Date;
  startDate: Date | null;
  endDate: Date | null;
  type: string;
  budget: number | null;
  requirements: string | null;
  client: {
    id: string;
    name: string | null;
    email: string;
    company: string | null;
  };
}

// Define the expected API response structure
interface ApiResponse {
  success: boolean;
  projects?: AdminProject[];
  message?: string; // Optional error message
}

const searchQuery = ref("");

// Fetch projects data
const { data, pending, error, refresh } = await useFetch<ApiResponse>(
  "/api/admin/projects",
  {
    lazy: false, // Fetch data before navigating
    server: true, // Ensure it runs server-side initially
  }
);

// Computed property for easier access to the projects array
const projects = computed(() => data.value?.projects || []);

// Filtered projects based on search query
const filteredProjects = computed(() => {
  if (!searchQuery.value.trim()) return projects.value;

  const query = searchQuery.value.toLowerCase();
  return projects.value.filter(
    (project) =>
      project.title.toLowerCase().includes(query) ||
      project.type.toLowerCase().includes(query) ||
      project.status.toLowerCase().includes(query) ||
      (project.client?.name?.toLowerCase() || "").includes(query) ||
      (project.client?.company?.toLowerCase() || "").includes(query)
  );
});

// Get status badge variant based on shadcn-vue badge component variants
const getStatusBadgeVariant = (
  status: string
): "default" | "destructive" | "outline" | "secondary" => {
  switch (status) {
    case "PENDING":
      return "outline";
    case "APPROVED":
      return "secondary";
    case "IN_PROGRESS":
      return "default";
    case "REVIEW":
      return "secondary";
    case "COMPLETED":
      return "default";
    case "CANCELLED":
      return "destructive";
    default:
      return "outline";
  }
};

// Format currency
const formatCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined) return "N/A";
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(value);
};

// Function to navigate to project detail page
const viewProject = (projectId: string) => {
  navigateTo(`/admin/projects/${projectId}`);
};
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Project Management</h1>
        <p class="text-muted-foreground">View and manage all client projects</p>
      </div>
    </div>

    <!-- Search and filters -->
    <div class="flex flex-wrap gap-3 items-center">
      <div class="relative flex-1 min-w-[200px]">
        <Search
          class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
        />
        <Input
          v-model="searchQuery"
          placeholder="Search projects..."
          class="pl-8 h-10"
        />
      </div>
      <Button @click="refresh" variant="outline" size="sm" class="h-10">
        <span v-if="pending">
          <Loader2 class="mr-2 h-4 w-4 animate-spin" />
          Refreshing
        </span>
        <span v-else>Refresh</span>
      </Button>
    </div>

    <!-- Loading State -->
    <div v-if="pending" class="flex items-center justify-center py-8">
      <Loader2 class="h-8 w-8 animate-spin text-muted-foreground" />
      <p class="ml-3 text-muted-foreground">Loading projects...</p>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="p-6 bg-destructive/10 border border-destructive/20 rounded-lg"
    >
      <div class="flex items-center">
        <AlertTriangle class="h-6 w-6 text-destructive mr-3" />
        <div>
          <p class="font-semibold text-destructive">Error Loading Projects</p>
          <p class="text-destructive/90 mt-1 text-sm">
            {{
              error?.data?.statusMessage ||
              error?.data?.message ||
              error?.message ||
              "Could not load projects data."
            }}
          </p>
        </div>
      </div>
      <Button
        @click="refresh"
        variant="outline"
        size="sm"
        class="mt-4 border-destructive/40 text-destructive"
      >
        Retry
      </Button>
    </div>

    <!-- No Results State -->
    <div
      v-else-if="filteredProjects.length === 0 && searchQuery"
      class="text-center py-8 border border-dashed rounded-lg"
    >
      <FolderKanban class="mx-auto h-12 w-12 text-muted-foreground/50" />
      <h3 class="mt-4 text-lg font-semibold">No projects found</h3>
      <p class="text-muted-foreground mt-2">
        No projects match your search criteria
      </p>
      <Button
        @click="searchQuery = ''"
        variant="outline"
        size="sm"
        class="mt-4"
      >
        Clear search
      </Button>
    </div>

    <!-- No Projects State -->
    <div
      v-else-if="projects.length === 0"
      class="text-center py-8 border border-dashed rounded-lg"
    >
      <FolderKanban class="mx-auto h-12 w-12 text-muted-foreground/50" />
      <h3 class="mt-4 text-lg font-semibold">No projects available</h3>
      <p class="text-muted-foreground mt-2">
        There are no projects in the system.
      </p>
    </div>

    <!-- Projects List Table -->
    <div v-else>
      <Card>
        <CardContent class="px-0 overflow-x-auto">
          <div class="min-w-[650px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead class="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow
                  v-for="project in filteredProjects"
                  :key="project.id"
                  class="cursor-pointer hover:bg-muted/50"
                  @click="viewProject(project.id)"
                >
                  <TableCell class="font-medium">
                    {{ project.title }}
                  </TableCell>
                  <TableCell>
                    <div>{{ project.client?.name || "Unknown" }}</div>
                    <div class="text-sm text-muted-foreground">
                      {{ project.client?.company || "No company" }}
                    </div>
                  </TableCell>
                  <TableCell>{{ project.type }}</TableCell>
                  <TableCell>
                    <Badge :variant="getStatusBadgeVariant(project.status)">
                      {{ project.status }}
                    </Badge>
                  </TableCell>
                  <TableCell>{{ formatCurrency(project.budget) }}</TableCell>
                  <TableCell>{{ formatDate(project.createdAt) }}</TableCell>
                  <TableCell class="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      @click.stop="viewProject(project.id)"
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

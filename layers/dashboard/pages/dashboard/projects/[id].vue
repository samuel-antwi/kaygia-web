<script setup lang="ts">
import {
  ArrowLeft,
  Calendar,
  Clock,
  DollarSign,
  FileText,
  Tag,
  Banknote,
} from "lucide-vue-next";
import { useProjectStore } from "~/layers/dashboard/stores/projectStore";
import type { ProjectStatus } from "../../../types/project";

// Get the project ID from the route
const route = useRoute();
const id = route.params.id as string;

definePageMeta({
  layout: "dashboard",
  middleware: "auth",
});

// Initialize the project store
const projectStore = useProjectStore();
const { currentProject, isLoading, error } = storeToRefs(projectStore);

// Status options for displaying
const statusOptions = [
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "REVIEW", label: "In Review" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

// Fetch the project on component mount
onMounted(async () => {
  await projectStore.fetchProject(id);
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

// Format date
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
</script>

<template>
  <div>
    <!-- Back button -->
    <Button variant="ghost" class="mb-4" as-child>
      <NuxtLink to="/dashboard/projects" class="flex items-center">
        <ArrowLeft class="mr-2 h-4 w-4" />
        Back to Projects
      </NuxtLink>
    </Button>

    <!-- Loading state -->
    <div
      v-if="isLoading && !currentProject"
      class="flex items-center justify-center min-h-[60vh]"
    >
      <div class="text-center">
        <div
          class="inline-block animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mb-4"
        ></div>
        <p class="text-muted-foreground">Loading project details...</p>
      </div>
    </div>

    <!-- Error state -->
    <div
      v-else-if="error"
      class="p-6 bg-destructive/10 rounded-lg border border-destructive text-center"
    >
      <p class="text-destructive font-medium">{{ error }}</p>
      <Button variant="outline" class="mt-4" as-child>
        <NuxtLink to="/dashboard/projects">Return to Projects</NuxtLink>
      </Button>
    </div>

    <!-- Project details -->
    <div v-else-if="currentProject" class="space-y-6">
      <!-- Project header -->
      <div
        class="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h2 class="text-2xl sm:text-3xl font-bold mb-2">
            {{ currentProject.title }}
          </h2>
          <div class="flex items-center">
            <Badge :class="getStatusClass(currentProject.status)">
              {{ formatStatus(currentProject.status) }}
            </Badge>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <Badge variant="outline" class="flex items-center gap-1">
            <Tag class="h-3.5 w-3.5" />
            {{ formatStatus(currentProject.type) }}
          </Badge>
          <Badge variant="outline" class="flex items-center gap-1">
            <Calendar class="h-3.5 w-3.5" />
            {{ formatDate(currentProject.createdAt) }}
          </Badge>
        </div>
      </div>

      <!-- Project details -->
      <div class="grid md:grid-cols-3 gap-6">
        <!-- Main details -->
        <div class="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p v-if="currentProject.description" class="whitespace-pre-wrap">
                {{ currentProject.description }}
              </p>
              <p v-else class="text-muted-foreground italic">
                No description provided
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <p v-if="currentProject.requirements" class="whitespace-pre-wrap">
                {{ currentProject.requirements }}
              </p>
              <p v-else class="text-muted-foreground italic">
                No requirements specified
              </p>
            </CardContent>
          </Card>
        </div>

        <!-- Project metadata -->
        <div class="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
              <div>
                <h4 class="text-sm font-medium text-muted-foreground mb-1">
                  Budget
                </h4>
                <div class="flex items-center">
                  <Banknote class="h-4 w-4 mr-1 text-muted-foreground" />
                  <span v-if="currentProject.budget" class="font-medium">
                    {{
                      currentProject.budget.toLocaleString("en-UK", {
                        style: "currency",
                        currency: "GBP",
                      })
                    }}
                  </span>
                  <span v-else class="text-muted-foreground italic"
                    >Not specified</span
                  >
                </div>
              </div>

              <div>
                <h4 class="text-sm font-medium text-muted-foreground mb-1">
                  Created On
                </h4>
                <div class="flex items-center">
                  <Calendar class="h-4 w-4 mr-1 text-muted-foreground" />
                  <span class="font-medium">{{
                    formatDate(currentProject.createdAt)
                  }}</span>
                </div>
              </div>

              <div>
                <h4 class="text-sm font-medium text-muted-foreground mb-1">
                  Last Updated
                </h4>
                <div class="flex items-center">
                  <Clock class="h-4 w-4 mr-1 text-muted-foreground" />
                  <span class="font-medium">{{
                    formatDate(currentProject.updatedAt)
                  }}</span>
                </div>
              </div>

              <div v-if="currentProject.startDate">
                <h4 class="text-sm font-medium text-muted-foreground mb-1">
                  Start Date
                </h4>
                <div class="flex items-center">
                  <Calendar class="h-4 w-4 mr-1 text-muted-foreground" />
                  <span class="font-medium">{{
                    formatDate(currentProject.startDate)
                  }}</span>
                </div>
              </div>

              <div v-if="currentProject.endDate">
                <h4 class="text-sm font-medium text-muted-foreground mb-1">
                  End Date
                </h4>
                <div class="flex items-center">
                  <Calendar class="h-4 w-4 mr-1 text-muted-foreground" />
                  <span class="font-medium">{{
                    formatDate(currentProject.endDate)
                  }}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import {
  AlertTriangle,
  ArrowLeft,
  Building,
  Calendar,
  CheckCircle2,
  CircleDollarSign,
  ClipboardList,
  Clock,
  FileText,
  FolderKanban,
  Loader2,
  Mail,
  User2,
} from "lucide-vue-next";
import { useToast } from "@/components/ui/toast/use-toast";

definePageMeta({
  layout: "admin",
});

// Define the structure for a project
interface Project {
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

// Define the API response structure
interface ApiResponse {
  success: boolean;
  project?: Project;
  message?: string;
}

// Define the status update API response
interface StatusUpdateResponse {
  success: boolean;
  message?: string;
  project?: Project;
}

const route = useRoute();
const projectId = computed(() => route.params.id as string);
const { toast } = useToast();
const isUpdatingStatus = ref(false);

// Fetch the project data
const { data, pending, error, refresh } = await useFetch<ApiResponse>(
  () => `/api/admin/projects/${projectId.value}`,
  {
    lazy: false,
    server: true,
    watch: [projectId],
  }
);

// Computed property for easier access to the project data
const project = computed(() => data.value?.project);

// List of valid project statuses
const projectStatuses = [
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "REVIEW", label: "Under Review" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

// Function to format date
const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return "N/A";
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// Format currency
const formatCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined) return "N/A";
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(value);
};

// Function to update project status
const updateProjectStatus = async (newStatus: any) => {
  if (!project.value || isUpdatingStatus.value || !newStatus) return;

  // Ensure we have a string value
  const statusValue = String(newStatus);

  // Don't do anything if the status is the same
  if (project.value.status === statusValue) return;

  isUpdatingStatus.value = true;

  try {
    const { data } = await useFetch<StatusUpdateResponse>(
      `/api/admin/projects/${projectId.value}/status`,
      {
        method: "PUT",
        body: { status: statusValue },
      }
    );

    if (data.value?.success) {
      await refresh();
      toast({
        title: "Status Updated",
        description:
          data.value.message || `Project status updated to ${statusValue}`,
        variant: "default",
        duration: 3000,
      });
    } else {
      toast({
        title: "Error",
        description: data.value?.message || "Failed to update project status",
        variant: "destructive",
        duration: 3000,
      });
    }
  } catch (err: any) {
    console.error("Error updating project status:", err);
    toast({
      title: "Error",
      description: err.message || "An error occurred while updating the status",
      variant: "destructive",
      duration: 3000,
    });
  } finally {
    isUpdatingStatus.value = false;
  }
};

// Get status color for labels
const getStatusColor = (status: string) => {
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
  <div class="container mx-auto py-6 space-y-6">
    <!-- Back Button -->
    <NuxtLink
      to="/admin/projects"
      class="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
    >
      <ArrowLeft class="w-4 h-4 mr-1" />
      Back to Projects
    </NuxtLink>

    <!-- Loading State -->
    <div v-if="pending" class="flex items-center justify-center py-20">
      <Loader2 class="h-10 w-10 animate-spin text-muted-foreground" />
      <p class="ml-3 text-muted-foreground">Loading project details...</p>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="p-6 bg-destructive/10 border border-destructive/20 rounded-lg"
    >
      <div class="flex items-center">
        <AlertTriangle class="h-6 w-6 text-destructive mr-3" />
        <div>
          <p class="font-semibold text-destructive">Error Loading Project</p>
          <p class="text-destructive/90 mt-1 text-sm">
            {{
              error?.data?.statusMessage ||
              error?.data?.message ||
              error?.message ||
              "Could not load project data."
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

    <!-- No Project Data State -->
    <div
      v-else-if="!project"
      class="text-center py-10 border border-dashed rounded-md"
    >
      <p class="text-muted-foreground">
        Project data could not be loaded or does not exist.
      </p>
      <Button @click="refresh" variant="outline" size="sm" class="mt-3">
        Retry
      </Button>
    </div>

    <!-- Project Data Loaded State -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left Column: Project Information -->
      <div class="lg:col-span-2 space-y-4">
        <Card>
          <CardHeader
            class="flex flex-row items-center justify-between space-y-0 pb-2"
          >
            <div>
              <CardTitle class="text-xl">{{ project.title }}</CardTitle>
              <CardDescription
                >Project Type: {{ project.type }}</CardDescription
              >
            </div>
            <div :class="getStatusColor(project.status)" class="font-semibold">
              {{ project.status }}
            </div>
          </CardHeader>
          <CardContent class="space-y-4">
            <div v-if="project.description" class="mt-2 space-y-1">
              <h4 class="text-sm font-medium flex items-center">
                <FileText class="h-4 w-4 mr-2 text-muted-foreground" />
                Description
              </h4>
              <p class="text-sm text-muted-foreground">
                {{ project.description }}
              </p>
            </div>

            <div v-if="project.requirements" class="mt-4 space-y-1">
              <h4 class="text-sm font-medium flex items-center">
                <ClipboardList class="h-4 w-4 mr-2 text-muted-foreground" />
                Requirements
              </h4>
              <p class="text-sm text-muted-foreground whitespace-pre-line">
                {{ project.requirements }}
              </p>
            </div>

            <Separator />

            <!-- Project Details Section -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-1">
                <h4 class="text-sm font-medium flex items-center">
                  <Calendar class="h-4 w-4 mr-2 text-muted-foreground" />
                  Created
                </h4>
                <p class="text-sm text-muted-foreground">
                  {{ formatDate(project.createdAt) }}
                </p>
              </div>

              <div class="space-y-1">
                <h4 class="text-sm font-medium flex items-center">
                  <Clock class="h-4 w-4 mr-2 text-muted-foreground" />
                  Last Updated
                </h4>
                <p class="text-sm text-muted-foreground">
                  {{ formatDate(project.updatedAt) }}
                </p>
              </div>

              <div class="space-y-1">
                <h4 class="text-sm font-medium flex items-center">
                  <Calendar class="h-4 w-4 mr-2 text-muted-foreground" />
                  Start Date
                </h4>
                <p class="text-sm text-muted-foreground">
                  {{ formatDate(project.startDate) }}
                </p>
              </div>

              <div class="space-y-1">
                <h4 class="text-sm font-medium flex items-center">
                  <CheckCircle2 class="h-4 w-4 mr-2 text-muted-foreground" />
                  End Date
                </h4>
                <p class="text-sm text-muted-foreground">
                  {{ formatDate(project.endDate) }}
                </p>
              </div>

              <div class="space-y-1">
                <h4 class="text-sm font-medium flex items-center">
                  <CircleDollarSign
                    class="h-4 w-4 mr-2 text-muted-foreground"
                  />
                  Budget
                </h4>
                <p class="text-sm text-muted-foreground">
                  {{ formatCurrency(project.budget) }}
                </p>
              </div>

              <div class="space-y-1">
                <h4 class="text-sm font-medium flex items-center">
                  <FolderKanban class="h-4 w-4 mr-2 text-muted-foreground" />
                  Project Type
                </h4>
                <p class="text-sm text-muted-foreground">{{ project.type }}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Right Column: Client Information and Status Management -->
      <div class="space-y-4">
        <!-- Client Information Card -->
        <Card>
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="flex items-center">
              <User2 class="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{{ project.client?.name || "Unknown Client" }}</span>
            </div>
            <div class="flex items-center">
              <Mail class="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{{ project.client?.email }}</span>
            </div>
            <div v-if="project.client?.company" class="flex items-center">
              <Building class="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{{ project.client?.company }}</span>
            </div>

            <div class="mt-2">
              <NuxtLink :to="`/admin/users/${project.client.id}`">
                <Button variant="outline" size="sm" class="w-full">
                  View Client Profile
                </Button>
              </NuxtLink>
            </div>
          </CardContent>
        </Card>

        <!-- Status Management Card -->
        <Card>
          <CardHeader>
            <CardTitle>Status Management</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <p class="text-sm text-muted-foreground">
              Current Status:
              <span class="font-medium" :class="getStatusColor(project.status)">
                {{ project.status }}
              </span>
            </p>

            <div class="relative">
              <Select
                :model-value="project.status"
                @update:model-value="updateProjectStatus"
                :disabled="isUpdatingStatus"
              >
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="status in projectStatuses"
                    :key="status.value"
                    :value="status.value"
                  >
                    {{ status.label }}
                  </SelectItem>
                </SelectContent>
              </Select>

              <!-- Loading spinner overlay -->
              <div
                v-if="isUpdatingStatus"
                class="absolute inset-0 flex items-center justify-center bg-background/50 rounded"
              >
                <Loader2 class="h-4 w-4 animate-spin" />
              </div>
            </div>

            <Alert variant="destructive" class="mt-3">
              <AlertTriangle class="h-4 w-4" />
              <AlertTitle>Important</AlertTitle>
              <AlertDescription>
                Changing the project status may trigger notifications to the
                client.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>

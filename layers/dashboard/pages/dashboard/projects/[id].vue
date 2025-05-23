<script setup lang="ts">
import { computed, ref } from "vue";
import { ArrowLeft, AlertTriangle, Loader2 } from "lucide-vue-next";

// Import client-facing components
import ProjectOverviewCard from "~/layers/dashboard/components/projects/ProjectOverviewCard.vue";
import ProjectProgressCard from "~/layers/dashboard/components/projects/ProjectProgressCard.vue";
import ProjectUpdatesCard from "~/layers/dashboard/components/projects/ProjectUpdatesCard.vue";
import ProjectDeliverablesCard from "~/layers/dashboard/components/projects/ProjectDeliverablesCard.vue";
import ProjectSupportCard from "~/layers/dashboard/components/projects/ProjectSupportCard.vue";
import ProjectPreviewCard from "~/layers/dashboard/components/projects/ProjectPreviewCard.vue";

definePageMeta({
  layout: "dashboard",
  middleware: "auth",
});

// Define the structure for a project (client-facing fields only)
interface Project {
  id: string;
  title: string;
  description: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  startDate: Date | null;
  endDate: Date | null;
  type: string;
  budget: number | null;
  
  // Progress tracking
  progress?: number;
  currentPhase?: string | null;
  currentPhaseName?: string | null;
  
  // Preview
  previewUrl?: string | null;
  previewPassword?: string | null;
  previewEnabled?: boolean;
  previewExpiresAt?: Date | string | null;
  
  // Client-relevant fields
  timelinePreference?: string | null;
  preferredLaunchDate?: Date | null;
  targetAudience?: string | null;
  businessGoals?: string | null;
  successMetrics?: string | null;
  
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

const route = useRoute();
const projectId = computed(() => route.params.id as string);

// Fetch the project data
const { data, pending, error, refresh } = await useFetch<ApiResponse>(
  () => `/api/projects/${projectId.value}`,
  {
    lazy: false,
    server: true,
    watch: [projectId],
  }
);

// Computed property for easier access to the project data
const project = computed(() => data.value?.project);

// Get status color for display
const getStatusColor = (status: string): string => {
  switch (status) {
    case "PENDING":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "APPROVED":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "IN_PROGRESS":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "REVIEW":
      return "bg-cyan-100 text-cyan-800 border-cyan-200";
    case "COMPLETED":
      return "bg-green-100 text-green-800 border-green-200";
    case "CANCELLED":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

// Get user-friendly status text
const getStatusText = (status: string): string => {
  switch (status) {
    case "PENDING":
      return "Awaiting Approval";
    case "APPROVED":
      return "Approved - Starting Soon";
    case "IN_PROGRESS":
      return "In Development";
    case "REVIEW":
      return "Under Review";
    case "COMPLETED":
      return "Project Complete";
    case "CANCELLED":
      return "Project Cancelled";
    default:
      return status;
  }
};
</script>

<template>
  <div class="container mx-auto py-6 space-y-6">
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
        Project not found or you don't have access to this project.
      </p>
      <Button @click="refresh" variant="outline" size="sm" class="mt-3">
        Retry
      </Button>
    </div>

    <!-- Project Data Loaded State -->
    <div v-else class="space-y-6">
      <!-- Header with Back Button -->
      <div class="flex items-center justify-between">
        <Button variant="ghost" class="mb-4" as-child>
          <NuxtLink to="/dashboard/projects" class="flex items-center">
            <ArrowLeft class="mr-2 h-4 w-4" />
            Back to Projects
          </NuxtLink>
        </Button>
        
        <!-- Status Badge -->
        <Badge :class="getStatusColor(project.status)" variant="outline" class="text-sm px-3 py-1">
          {{ getStatusText(project.status) }}
        </Badge>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column: Main Project Information -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Project Overview -->
          <ProjectOverviewCard
            :title="project.title"
            :description="project.description"
            :type="project.type"
            :target-audience="project.targetAudience"
            :business-goals="project.businessGoals"
            :budget="project.budget"
            :preferred-launch-date="project.preferredLaunchDate"
          />

          <!-- Project Progress -->
          <ProjectProgressCard
            :status="project.status"
            :progress="project.progress"
            :current-phase="project.currentPhase"
            :current-phase-name="project.currentPhaseName"
            :created-at="project.createdAt"
            :start-date="project.startDate"
            :end-date="project.endDate"
            :timeline-preference="project.timelinePreference"
          />

          <!-- Project Updates -->
          <ProjectUpdatesCard :project-id="project.id" />

          <!-- Project Deliverables -->
          <ProjectDeliverablesCard :project-id="project.id" />
        </div>

        <!-- Right Column: Support and Actions -->
        <div class="space-y-6">
          <!-- Preview Card -->
          <ProjectPreviewCard 
            :preview-url="project.previewUrl"
            :preview-password="project.previewPassword"
            :preview-enabled="project.previewEnabled"
            :preview-expires-at="project.previewExpiresAt"
            :project-title="project.title"
          />
          
          <!-- Support Card -->
          <ProjectSupportCard :project-id="project.id" />

          <!-- Quick Actions Card -->
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent class="space-y-3">
              <Button class="w-full" variant="outline" as-child>
                <NuxtLink :to="`/dashboard/projects/${project.id}/files`">
                  Upload Files
                </NuxtLink>
              </Button>
              
              <Button class="w-full" variant="outline" as-child>
                <NuxtLink to="/dashboard/tickets">
                  Create Support Ticket
                </NuxtLink>
              </Button>
              
              <Button class="w-full" variant="outline">
                Schedule Meeting
              </Button>
            </CardContent>
          </Card>

          <!-- Project Details Summary -->
          <Card>
            <CardHeader>
              <CardTitle>Project Summary</CardTitle>
            </CardHeader>
            <CardContent class="space-y-3 text-sm">
              <div class="flex justify-between">
                <span class="text-muted-foreground">Project ID:</span>
                <span class="font-mono text-xs">{{ project.id.slice(0, 8) }}...</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Created:</span>
                <span>{{ new Date(project.createdAt).toLocaleDateString() }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Last Updated:</span>
                <span>{{ new Date(project.updatedAt).toLocaleDateString() }}</span>
              </div>
              <div v-if="project.successMetrics" class="pt-3 border-t">
                <h4 class="font-medium mb-2">Success Metrics</h4>
                <p class="text-muted-foreground text-xs">{{ project.successMetrics }}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </div>
</template>
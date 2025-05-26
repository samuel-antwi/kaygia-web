<script setup lang="ts">
import { computed, ref } from "vue";
import { AlertTriangle, Loader2, Settings } from "lucide-vue-next";
import { useToast } from "@/components/ui/toast/use-toast";
import ProgressBar from "~/layers/core/components/ProgressBar.vue";

// Import modular components
import ProjectHeader from "~/layers/admin/components/projects/ProjectHeader.vue";
import ProjectBasicInfo from "~/layers/admin/components/projects/ProjectBasicInfo.vue";
import ProjectTimelineSection from "~/layers/admin/components/projects/ProjectTimelineSection.vue";
import ProjectTechnicalSection from "~/layers/admin/components/projects/ProjectTechnicalSection.vue";
import ProjectContentSection from "~/layers/admin/components/projects/ProjectContentSection.vue";
import ProjectBusinessSection from "~/layers/admin/components/projects/ProjectBusinessSection.vue";
import ProjectCommunicationSection from "~/layers/admin/components/projects/ProjectCommunicationSection.vue";
import ClientInfoCard from "~/layers/admin/components/projects/ClientInfoCard.vue";
import StatusManagementCard from "~/layers/admin/components/projects/StatusManagementCard.vue";

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
  progress?: number | null;
  
  // Timeline & Scope
  timelinePreference?: string | null;
  preferredLaunchDate?: Date | null;
  maintenanceRequired?: boolean | null;
  
  // Technical Requirements
  hostingPreference?: string | null;
  domainStatus?: string | null;
  integrationsNeeded?: string[] | null;
  performanceRequirements?: string | null;
  seoRequirements?: string | null;
  
  // Content & Assets
  contentReadiness?: string | null;
  brandAssetsStatus?: string | null;
  competitorReferences?: string | null;
  cmsRequired?: boolean | null;
  
  // Business Context
  targetAudience?: string | null;
  businessGoals?: string | null;
  successMetrics?: string | null;
  complianceRequirements?: string[] | null;
  
  // Communication (legacy fields)
  communicationPreference?: string | null;
  timezone?: string | null;
  keyStakeholders?: string | null;
  approvalProcess?: string | null;
  
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

// Fetch progress data for accurate milestone-based progress
const { data: progressData } = await useFetch(`/api/admin/projects/${projectId.value}/progress`, {
  server: false,
  watch: [projectId]
});

// Use calculated progress if available, otherwise fall back to project progress
const projectProgress = computed(() => progressData.value?.project?.calculatedProgress ?? project.value?.progress ?? 0);

// Function to update project status
const updateProjectStatus = async (newStatus: string) => {
  if (!project.value || isUpdatingStatus.value || !newStatus) return;

  // Don't do anything if the status is the same
  if (project.value.status === newStatus) return;

  isUpdatingStatus.value = true;

  try {
    const { data } = await useFetch<StatusUpdateResponse>(
      `/api/admin/projects/${projectId.value}/status`,
      {
        method: "PUT",
        body: { status: newStatus },
      }
    );

    if (data.value?.success) {
      await refresh();
      toast({
        title: "Status Updated",
        description: data.value.message || `Project status updated to ${newStatus}`,
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
        Project data could not be loaded or does not exist.
      </p>
      <Button @click="refresh" variant="outline" size="sm" class="mt-3">
        Retry
      </Button>
    </div>

    <!-- Project Data Loaded State -->
    <div v-else class="space-y-6">
      <!-- Project Header -->
      <ProjectHeader 
        :title="project.title"
        :type="project.type"
        :status="project.status"
        :project-id="projectId"
        :show-manage-button="true"
      />

      <!-- Project Progress -->
      <Card>
        <CardHeader class="pb-3">
          <div class="flex items-center justify-between">
            <CardTitle class="text-lg">Project Progress</CardTitle>
            <span class="text-2xl font-bold text-primary">{{ projectProgress }}%</span>
          </div>
        </CardHeader>
        <CardContent>
          <ProgressBar 
            :progress="projectProgress"
            :show-percentage="false"
            size="lg"
            :variant="project.status === 'COMPLETED' ? 'success' : project.status === 'CANCELLED' ? 'danger' : 'default'"
          />
          <p class="text-sm text-muted-foreground mt-2">
            {{ project.status === 'PENDING' ? 'Awaiting approval' : 
               project.status === 'COMPLETED' ? 'Project completed' :
               project.status === 'CANCELLED' ? 'Project cancelled' :
               'Based on milestone completion' }}
          </p>
        </CardContent>
      </Card>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column: Project Information -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Basic Project Information -->
          <ProjectBasicInfo
            :description="project.description"
            :requirements="project.requirements"
            :created-at="project.createdAt"
            :updated-at="project.updatedAt"
            :start-date="project.startDate"
            :end-date="project.endDate"
            :budget="project.budget"
            :type="project.type"
          />

          <!-- Timeline & Scope Section -->
          <ProjectTimelineSection
            :timeline-preference="project.timelinePreference"
            :preferred-launch-date="project.preferredLaunchDate"
            :maintenance-required="project.maintenanceRequired"
          />

          <!-- Technical Requirements Section -->
          <ProjectTechnicalSection
            :hosting-preference="project.hostingPreference"
            :domain-status="project.domainStatus"
            :integrations-needed="project.integrationsNeeded"
            :performance-requirements="project.performanceRequirements"
            :seo-requirements="project.seoRequirements"
            :cms-required="project.cmsRequired"
          />

          <!-- Content & Assets Section -->
          <ProjectContentSection
            :content-readiness="project.contentReadiness"
            :brand-assets-status="project.brandAssetsStatus"
            :competitor-references="project.competitorReferences"
          />

          <!-- Business Context Section -->
          <ProjectBusinessSection
            :target-audience="project.targetAudience"
            :business-goals="project.businessGoals"
            :success-metrics="project.successMetrics"
            :compliance-requirements="project.complianceRequirements"
          />

          <!-- Communication & Process Section (for legacy projects) -->
          <ProjectCommunicationSection
            :communication-preference="project.communicationPreference"
            :timezone="project.timezone"
            :key-stakeholders="project.keyStakeholders"
            :approval-process="project.approvalProcess"
          />
        </div>

        <!-- Right Column: Client Information and Status Management -->
        <div class="space-y-6">
          <!-- Client Information Card -->
          <ClientInfoCard :client="project.client" />

          <!-- Status Management Card -->
          <StatusManagementCard
            :current-status="project.status"
            :is-updating="isUpdatingStatus"
            @update-status="updateProjectStatus"
          />
        </div>
      </div>
    </div>
  </div>
</template>
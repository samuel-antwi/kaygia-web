<script setup lang="ts">
import { computed, ref, nextTick } from "vue";
import { ArrowLeft, Plus, Upload, MessageSquare, BarChart3, FileText, Settings, Eye, Lock } from "lucide-vue-next";
import AdminProjectUpdates from "~/layers/admin/components/projects/AdminProjectUpdates.vue";
import AdminProjectDeliverables from "~/layers/admin/components/projects/AdminProjectDeliverables.vue";
import AdminProjectProgress from "~/layers/admin/components/projects/AdminProjectProgress.vue";
import AdminProjectFiles from "~/layers/admin/components/projects/AdminProjectFiles.vue";
import AdminProjectComments from "~/layers/admin/components/projects/AdminProjectComments.vue";
import PreviewUrlCard from "~/layers/admin/components/projects/PreviewUrlCard.vue";

definePageMeta({
  layout: "admin",
});

const route = useRoute();
const projectId = computed(() => route.params.id as string);

// Fetch project data
const { data: projectData, pending, error, refresh } = await useFetch(`/api/admin/projects/${projectId.value}`)
const project = computed(() => projectData.value?.project);

// Active tab management
const activeTab = ref("overview");

// Trigger refs for child components
const triggerUpdateForm = ref(false);
const triggerDeliverableForm = ref(false);
const triggerMilestoneForm = ref(false);

// Quick actions - organized by visibility
const clientFacingActions = [
  {
    id: "update",
    label: "Add Project Update",
    icon: MessageSquare,
    description: "Post updates visible to client",
    action: () => {
      activeTab.value = "updates";
      nextTick(() => {
        triggerUpdateForm.value = true;
        setTimeout(() => triggerUpdateForm.value = false, 100);
      });
    }
  },
  {
    id: "deliverable", 
    label: "Upload Deliverable",
    icon: Upload,
    description: "Upload files for client review",
    action: () => {
      activeTab.value = "deliverables";
      nextTick(() => {
        triggerDeliverableForm.value = true;
        setTimeout(() => triggerDeliverableForm.value = false, 100);
      });
    }
  }
];

const internalActions = [
  {
    id: "progress",
    label: "Update Progress",
    icon: BarChart3,
    description: "Track internal milestones",
    action: () => {
      activeTab.value = "progress";
      nextTick(() => {
        triggerMilestoneForm.value = true;
        setTimeout(() => triggerMilestoneForm.value = false, 100);
      });
    }
  },
  {
    id: "files",
    label: "Manage Files",
    icon: FileText,
    description: "Organize internal files",
    action: () => activeTab.value = "files"
  }
];

// Get status color
const getStatusColor = (status: string): string => {
  switch (status) {
    case "PENDING":
      return "text-amber-600 bg-amber-50 border-amber-200";
    case "APPROVED":
      return "text-blue-600 bg-blue-50 border-blue-200";
    case "IN_PROGRESS":
      return "text-purple-600 bg-purple-50 border-purple-200";
    case "REVIEW":
      return "text-cyan-600 bg-cyan-50 border-cyan-200";
    case "COMPLETED":
      return "text-green-600 bg-green-50 border-green-200";
    case "CANCELLED":
      return "text-red-600 bg-red-50 border-red-200";
    default:
      return "text-gray-600 bg-gray-50 border-gray-200";
  }
};
</script>

<template>
  <div class="container mx-auto py-6 space-y-6">
    <!-- Loading State -->
    <div v-if="pending" class="flex items-center justify-center py-20">
      <div class="text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p class="mt-2 text-muted-foreground">Loading project...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-10">
      <p class="text-destructive">Error loading project: {{ error.statusMessage }}</p>
      <Button @click="refresh" variant="outline" class="mt-4">Retry</Button>
    </div>

    <!-- Main Content -->
    <div v-else-if="project" class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <Button variant="ghost" as-child>
            <NuxtLink :to="`/admin/projects/${projectId}`" class="flex items-center">
              <ArrowLeft class="mr-2 h-4 w-4" />
              Back to Project Details
            </NuxtLink>
          </Button>
          
          <div>
            <h1 class="text-2xl font-bold">Manage: {{ project.title }}</h1>
            <div class="flex items-center space-x-2 mt-1">
              <Badge :class="getStatusColor(project.status)" variant="outline">
                {{ project.status }}
              </Badge>
              <span class="text-sm text-muted-foreground">
                Client: {{ project.client?.name || project.client?.email }}
              </span>
            </div>
          </div>
        </div>

        <Button as-child>
          <NuxtLink :to="`/dashboard/projects/${projectId}`" target="_blank">
            View Client Page
          </NuxtLink>
        </Button>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Client-Facing Actions -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center">
              <Eye class="h-5 w-5 mr-2 text-green-600" />
              Client-Facing Actions
            </CardTitle>
            <CardDescription>
              These actions create content visible to your client
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div class="space-y-3">
              <div
                v-for="action in clientFacingActions"
                :key="action.id"
                @click="action.action"
                class="p-4 border border-green-200 bg-green-50/50 rounded-lg cursor-pointer hover:bg-green-50 transition-colors hover:shadow-md"
              >
                <div class="flex items-center space-x-3">
                  <div class="p-2 bg-green-100 rounded-lg">
                    <component :is="action.icon" class="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 class="font-medium">{{ action.label }}</h3>
                    <p class="text-sm text-muted-foreground">{{ action.description }}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Internal Actions -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center">
              <Lock class="h-5 w-5 mr-2 text-blue-600" />
              Internal Management
            </CardTitle>
            <CardDescription>
              These actions are for internal tracking only
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div class="space-y-3">
              <div
                v-for="action in internalActions"
                :key="action.id"
                @click="action.action"
                class="p-4 border border-blue-200 bg-blue-50/50 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors hover:shadow-md"
              >
                <div class="flex items-center space-x-3">
                  <div class="p-2 bg-blue-100 rounded-lg">
                    <component :is="action.icon" class="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 class="font-medium">{{ action.label }}</h3>
                    <p class="text-sm text-muted-foreground">{{ action.description }}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Preview URL Card -->
      <PreviewUrlCard 
        :project-id="projectId"
        :project-title="project.title"
        :preview-url="project.previewUrl"
        :preview-password="project.previewPassword"
        :preview-enabled="project.previewEnabled"
        :preview-expires-at="project.previewExpiresAt"
      />

      <!-- Management Tabs -->
      <Card>
        <CardHeader>
          <div class="flex space-x-4 border-b">
            <button
              v-for="tab in [
                { id: 'overview', label: 'Overview', icon: null },
                { id: 'updates', label: 'Project Updates', icon: Eye, type: 'client' },
                { id: 'deliverables', label: 'Deliverables', icon: Eye, type: 'client' },
                { id: 'comments', label: 'Comments', icon: Eye, type: 'client' },
                { id: 'progress', label: 'Progress Tracking', icon: Lock, type: 'internal' },
                { id: 'files', label: 'File Management', icon: Lock, type: 'internal' }
              ]"
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="[
                'px-4 py-2 font-medium transition-colors border-b-2 flex items-center gap-2',
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              ]"
            >
              <component 
                v-if="tab.icon" 
                :is="tab.icon" 
                :class="[
                  'h-3 w-3',
                  tab.type === 'client' ? 'text-green-600' : 'text-blue-600'
                ]" 
              />
              {{ tab.label }}
            </button>
          </div>
        </CardHeader>

        <CardContent class="p-6">
          <!-- Overview Tab -->
          <div v-if="activeTab === 'overview'" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader class="pb-2">
                  <CardTitle class="text-base">Recent Updates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div class="text-2xl font-bold">0</div>
                  <p class="text-sm text-muted-foreground">Updates this week</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader class="pb-2">
                  <CardTitle class="text-base">Pending Approvals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div class="text-2xl font-bold">0</div>
                  <p class="text-sm text-muted-foreground">Deliverables awaiting review</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader class="pb-2">
                  <CardTitle class="text-base">Project Files</CardTitle>
                </CardHeader>
                <CardContent>
                  <div class="text-2xl font-bold">0</div>
                  <p class="text-sm text-muted-foreground">Files uploaded</p>
                </CardContent>
              </Card>
            </div>

            <Alert>
              <MessageSquare class="h-4 w-4" />
              <AlertTitle>Getting Started</AlertTitle>
              <AlertDescription>
                Use the tabs above to manage client-facing features. Start by adding project updates to keep your client informed about progress.
              </AlertDescription>
            </Alert>
          </div>

          <!-- Updates Tab -->
          <div v-if="activeTab === 'updates'">
            <AdminProjectUpdates 
              :project-id="projectId" 
              :trigger-create="triggerUpdateForm" 
            />
          </div>

          <!-- Deliverables Tab -->
          <div v-if="activeTab === 'deliverables'">
            <AdminProjectDeliverables 
              :project-id="projectId" 
              :trigger-create="triggerDeliverableForm" 
            />
          </div>

          <!-- Progress Tab -->
          <div v-if="activeTab === 'progress'">
            <AdminProjectProgress 
              :project-id="projectId" 
              :project="project" 
              :trigger-create="triggerMilestoneForm" 
            />
          </div>

          <!-- Comments Tab -->
          <div v-if="activeTab === 'comments'">
            <AdminProjectComments :project-id="projectId" />
          </div>

          <!-- Files Tab -->
          <div v-if="activeTab === 'files'">
            <AdminProjectFiles :project-id="projectId" />
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
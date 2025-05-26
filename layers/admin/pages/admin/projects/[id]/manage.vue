<script setup lang="ts">
import { computed, ref, nextTick, watch } from "vue";
import {
  ArrowLeft,
  Plus,
  Upload,
  MessageSquare,
  BarChart3,
  FileText,
  Settings,
  Eye,
  Lock,
  Info,
  MoreVertical,
  ExternalLink,
  ChevronRight,
  Users,
  FolderOpen,
  CheckSquare,
  MessageCircle,
  Activity,
} from "lucide-vue-next";
import AdminProjectUpdates from "#layers/admin/components/projects/AdminProjectUpdates.vue";
import AdminProjectDeliverables from "#layers/admin/components/projects/AdminProjectDeliverables.vue";
import AdminProjectProgress from "#layers/admin/components/projects/AdminProjectProgress.vue";
import AdminProjectFiles from "#layers/admin/components/projects/AdminProjectFiles.vue";
import AdminProjectComments from "#layers/admin/components/projects/AdminProjectComments.vue";
import PreviewUrlCard from "#layers/admin/components/projects/PreviewUrlCard.vue";
import ProgressBar from "#layers/core/components/ProgressBar.vue";

definePageMeta({
  layout: "admin",
});

const route = useRoute();
const projectId = computed(() => route.params.id as string);

// Fetch project data
const {
  data: projectData,
  pending,
  error,
  refresh,
} = await useFetch(`/api/admin/projects/${projectId.value}`);
const project = computed(() => projectData.value?.project);

// Fetch progress data for consistent display
const { data: progressData } = await useFetch(
  `/api/admin/projects/${projectId.value}/progress`,
  {
    server: false,
  }
);

// Use calculated progress for consistency
const projectProgress = computed(
  () =>
    progressData.value?.project?.calculatedProgress ||
    project.value?.progress ||
    0
);

// Define tab types
type TabId =
  | "overview"
  | "updates"
  | "deliverables"
  | "progress"
  | "comments"
  | "files";

// Active tab management
const activeTab = ref<TabId>("overview");

// Track if components have been initialized
const initializedTabs = ref<Record<TabId, boolean>>({
  overview: true,
  updates: false,
  deliverables: false,
  progress: false,
  comments: false,
  files: false,
});

// Watch for tab changes to initialize components
watch(activeTab, (newTab) => {
  if (!initializedTabs.value[newTab]) {
    initializedTabs.value[newTab] = true;
  }
});

// Trigger refs for child components
const triggerUpdateForm = ref(false);
const triggerDeliverableForm = ref(false);
const triggerMilestoneForm = ref(false);

// Ref for scrolling to tab content
const tabSectionRef = ref<HTMLElement>();

// Function to scroll to tab content
const scrollToTabContent = () => {
  if (tabSectionRef.value) {
    tabSectionRef.value.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

// Simple formatting function for project type
const formatProjectType = (type: string | null | undefined) => {
  if (!type) return "Not specified";
  const types: Record<string, string> = {
    WEBSITE: "Website",
    E_COMMERCE: "E-commerce",
    WEB_APP: "Web Application",
    LANDING_PAGE: "Landing Page",
  };
  return types[type] || type;
};

// Quick actions - organized by visibility
const clientFacingActions = [
  {
    id: "update",
    tabId: "updates",
    label: "Add Project Update",
    icon: MessageSquare,
    description: "Post updates visible to client",
    action: () => {
      activeTab.value = "updates";
      scrollToTabContent();
      nextTick(() => {
        triggerUpdateForm.value = true;
        setTimeout(() => (triggerUpdateForm.value = false), 100);
      });
    },
  },
  {
    id: "deliverable",
    tabId: "deliverables",
    label: "Upload Deliverable",
    icon: Upload,
    description: "Upload files for client review",
    action: () => {
      activeTab.value = "deliverables";
      scrollToTabContent();
      nextTick(() => {
        triggerDeliverableForm.value = true;
        setTimeout(() => (triggerDeliverableForm.value = false), 100);
      });
    },
  },
];

const internalActions = [
  {
    id: "progress",
    tabId: "progress",
    label: "Update Progress",
    icon: BarChart3,
    description: "Track internal milestones",
    action: () => {
      activeTab.value = "progress";
      scrollToTabContent();
      nextTick(() => {
        triggerMilestoneForm.value = true;
        setTimeout(() => (triggerMilestoneForm.value = false), 100);
      });
    },
  },
  {
    id: "files",
    tabId: "files",
    label: "Manage Files",
    icon: FileText,
    description: "Organize internal files",
    action: () => {
      activeTab.value = "files";
      scrollToTabContent();
    },
  },
];

// Removed getStatusColor - using subtle Badge variants instead
</script>

<template>
  <div class="min-h-screen bg-gray-50/30">
    <!-- Loading State -->
    <div v-if="pending" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div
          class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"
        ></div>
        <p class="mt-2 text-muted-foreground">Loading project...</p>
      </div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="flex items-center justify-center min-h-screen"
    >
      <div class="text-center">
        <p class="text-destructive mb-4">Error loading project</p>
        <Button @click="refresh" variant="outline" size="sm">Try Again</Button>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else-if="project" class="mx-auto max-w-7xl">
      <!-- Simplified Header -->
      <div class="bg-white border-b px-6 py-4">
        <div class="flex items-center justify-between">
          <div>
            <div class="flex items-center gap-3 mb-1">
              <h1 class="text-2xl font-semibold text-gray-900">
                {{ project.title }}
              </h1>
              <Badge variant="secondary" class="font-normal">
                {{ project.status.replace("_", " ").toLowerCase() }}
              </Badge>
            </div>
            <p class="text-sm text-muted-foreground">
              {{ project.client?.name || project.client?.email }} •
              {{ formatProjectType(project.type) }}
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreVertical class="h-4 w-4 mr-2" />
                Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <NuxtLink :to="`/admin/projects/${projectId}`" class="flex items-center">
                  <Info class="h-4 w-4 mr-2" />
                  View Full Details
                </NuxtLink>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <NuxtLink 
                  :to="`/dashboard/projects/${projectId}`" 
                  target="_blank"
                  class="flex items-center"
                >
                  <ExternalLink class="h-4 w-4 mr-2" />
                  View as Client
                </NuxtLink>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <!-- Progress Bar -->
        <div class="mt-4">
          <div class="flex items-center justify-between mb-1">
            <span class="text-sm font-medium">Overall Progress</span>
            <span class="text-sm text-muted-foreground"
              >{{ projectProgress }}%</span
            >
          </div>
          <ProgressBar
            :progress="projectProgress"
            :show-percentage="false"
            size="sm"
          />
        </div>
      </div>

      <!-- Main Layout -->
      <div class="flex flex-col lg:flex-row gap-6 p-6 pl-0">
        <!-- Sidebar Navigation -->
        <aside class="lg:w-64 flex-shrink-0 space-y-6">
          <nav class="space-y-1">
            <button
              v-for="tab in [
                { id: 'overview', label: 'Overview', icon: Activity },
                {
                  id: 'updates',
                  label: 'Project Updates',
                  icon: MessageSquare,
                },
                {
                  id: 'deliverables',
                  label: 'Deliverables',
                  icon: CheckSquare,
                },
                { id: 'comments', label: 'Comments', icon: MessageCircle },
                { id: 'progress', label: 'Progress Tracking', icon: BarChart3 },
                { id: 'files', label: 'File Management', icon: FolderOpen },
              ]"
              :key="tab.id"
              @click="activeTab = tab.id as TabId"
              :class="[
                'w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                activeTab === tab.id
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              ]"
            >
              <component :is="tab.icon" class="h-4 w-4" />
              {{ tab.label }}
            </button>
          </nav>

          <!-- Compact Preview URL Info -->
          <Card v-if="project.previewUrl">
            <CardHeader class="pb-3">
              <CardTitle class="text-sm font-medium flex items-center gap-2">
                <ExternalLink class="h-3 w-3" />
                Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <a
                :href="project.previewUrl"
                target="_blank"
                class="text-xs text-blue-600 hover:underline break-all inline-flex items-center gap-1"
              >
                {{
                  project.previewUrl
                    .replace(/^https?:\/\//, "")
                    .substring(0, 25)
                }}{{
                  project.previewUrl.replace(/^https?:\/\//, "").length > 25
                    ? "..."
                    : ""
                }}
              </a>
              <div class="mt-2">
                <Badge
                  v-if="!project.previewEnabled"
                  variant="outline"
                  class="text-xs"
                >
                  Disabled
                </Badge>
                <Badge
                  v-else-if="
                    project.previewExpiresAt &&
                    new Date(project.previewExpiresAt) < new Date()
                  "
                  variant="outline"
                  class="text-xs"
                >
                  Expired
                </Badge>
                <Badge v-else variant="outline" class="text-xs text-green-600">
                  Active
                </Badge>
              </div>
            </CardContent>
          </Card>
        </aside>

        <!-- Main Content Area -->
        <main class="flex-1 min-w-0">
          <Card class="h-full">
            <CardContent class="p-6">
              <!-- Overview Tab -->
              <div v-show="activeTab === 'overview'" class="space-y-6">
                <div>
                  <h2 class="text-lg font-semibold mb-4">Quick Actions</h2>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      v-for="action in [
                        ...clientFacingActions,
                        ...internalActions,
                      ]"
                      :key="action.id"
                      @click="action.action"
                      class="flex items-start gap-3 p-4 rounded-lg border bg-white hover:bg-gray-50 transition-colors text-left"
                    >
                      <div class="p-2 rounded-md bg-gray-100">
                        <component
                          :is="action.icon"
                          class="h-4 w-4 text-gray-700"
                        />
                      </div>
                      <div class="flex-1">
                        <h3 class="font-medium text-sm">{{ action.label }}</h3>
                        <p class="text-xs text-muted-foreground mt-1">
                          {{ action.description }}
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                <Separator />

                <div>
                  <h2 class="text-lg font-semibold mb-4">Project Overview</h2>
                  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div>
                      <p class="text-sm text-muted-foreground">Status</p>
                      <p class="font-medium">
                        {{ project.status.replace("_", " ") }}
                      </p>
                    </div>
                    <div>
                      <p class="text-sm text-muted-foreground">Type</p>
                      <p class="font-medium">
                        {{ formatProjectType(project.type) }}
                      </p>
                    </div>
                    <div>
                      <p class="text-sm text-muted-foreground">Progress</p>
                      <p class="font-medium">{{ projectProgress }}%</p>
                    </div>
                    <div>
                      <p class="text-sm text-muted-foreground">Client</p>
                      <p class="font-medium">
                        {{ project.client?.name || project.client?.email }}
                      </p>
                    </div>
                  </div>

                  <!-- Full Preview URL Card in Overview -->
                  <PreviewUrlCard
                    :project-id="projectId"
                    :project-title="project.title"
                    :preview-url="project.previewUrl"
                    :preview-password="project.previewPassword"
                    :preview-enabled="project.previewEnabled"
                    :preview-expires-at="project.previewExpiresAt"
                  />
                </div>
              </div>

              <!-- Updates Tab -->
              <div v-show="activeTab === 'updates'" class="min-h-[300px]">
                <AdminProjectUpdates
                  v-if="initializedTabs.updates"
                  :project-id="projectId"
                  :trigger-create="triggerUpdateForm"
                />
                <div v-else class="flex items-center justify-center h-[300px]">
                  <div
                    class="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"
                  />
                </div>
              </div>

              <!-- Deliverables Tab -->
              <div v-show="activeTab === 'deliverables'" class="min-h-[300px]">
                <AdminProjectDeliverables
                  v-if="initializedTabs.deliverables"
                  :project-id="projectId"
                  :trigger-create="triggerDeliverableForm"
                />
                <div v-else class="flex items-center justify-center h-[300px]">
                  <div
                    class="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"
                  />
                </div>
              </div>

              <!-- Progress Tab -->
              <div v-show="activeTab === 'progress'" class="min-h-[300px]">
                <AdminProjectProgress
                  v-if="initializedTabs.progress"
                  :project-id="projectId"
                  :project="project"
                  :trigger-create="triggerMilestoneForm"
                />
                <div v-else class="flex items-center justify-center h-[300px]">
                  <div
                    class="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"
                  />
                </div>
              </div>

              <!-- Comments Tab -->
              <div v-show="activeTab === 'comments'" class="min-h-[300px]">
                <AdminProjectComments
                  v-if="initializedTabs.comments"
                  :project-id="projectId"
                />
                <div v-else class="flex items-center justify-center h-[300px]">
                  <div
                    class="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"
                  />
                </div>
              </div>

              <!-- Files Tab -->
              <div v-show="activeTab === 'files'" class="min-h-[300px]">
                <AdminProjectFiles
                  v-if="initializedTabs.files"
                  :project-id="projectId"
                />
                <div v-else class="flex items-center justify-center h-[300px]">
                  <div
                    class="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  </div>
</template>

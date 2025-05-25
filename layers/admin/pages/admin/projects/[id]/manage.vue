<script setup lang="ts">
import { computed, ref, nextTick, watch } from "vue";
import { ArrowLeft, Plus, Upload, MessageSquare, BarChart3, FileText, Settings, Eye, Lock, Info, MoreVertical, ExternalLink, ChevronRight } from "lucide-vue-next";
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

// Fetch progress data for consistent display
const { data: progressData } = await useFetch(`/api/admin/projects/${projectId.value}/progress`, {
  server: false
});

// Use calculated progress for consistency
const projectProgress = computed(() => progressData.value?.project?.calculatedProgress || project.value?.progress || 0);

// Define tab types
type TabId = 'overview' | 'updates' | 'deliverables' | 'progress' | 'comments' | 'files';

// Active tab management
const activeTab = ref<TabId>("overview");

// Track if components have been initialized
const initializedTabs = ref<Record<TabId, boolean>>({
  overview: true,
  updates: false,
  deliverables: false,
  progress: false,
  comments: false,
  files: false
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
    tabSectionRef.value.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

// Simple formatting function for project type
const formatProjectType = (type: string | null | undefined) => {
  if (!type) return 'Not specified';
  const types: Record<string, string> = {
    'WEBSITE': 'Website',
    'E_COMMERCE': 'E-commerce',
    'WEB_APP': 'Web Application',
    'LANDING_PAGE': 'Landing Page'
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
        setTimeout(() => triggerUpdateForm.value = false, 100);
      });
    }
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
        setTimeout(() => triggerDeliverableForm.value = false, 100);
      });
    }
  }
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
        setTimeout(() => triggerMilestoneForm.value = false, 100);
      });
    }
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
    }
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

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <MoreVertical class="h-4 w-4 mr-2" />
              View Options
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="w-48">
            <DropdownMenuItem @click="$router.push(`/admin/projects/${projectId}`)">
              <Info class="h-4 w-4 mr-2" />
              View Project Details
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <NuxtLink :to="`/dashboard/projects/${projectId}`" target="_blank" class="flex items-center">
                <ExternalLink class="h-4 w-4 mr-2" />
                View Client Page
                <span class="ml-auto text-xs text-muted-foreground">↗</span>
              </NuxtLink>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
              <button
                v-for="action in clientFacingActions"
                :key="action.id"
                @click="action.action"
                class="w-full p-4 border-2 border-green-200 bg-white rounded-lg text-left transition-all hover:border-green-400 hover:bg-green-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 group"
                :class="{ 'ring-2 ring-green-500 border-green-400 bg-green-50': activeTab === action.tabId }"
              >
                <div class="flex items-center space-x-3">
                  <div class="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                    <component :is="action.icon" class="h-5 w-5 text-green-600" />
                  </div>
                  <div class="flex-1">
                    <h3 class="font-medium text-gray-900">{{ action.label }}</h3>
                    <p class="text-sm text-muted-foreground">{{ action.description }}</p>
                  </div>
                  <ChevronRight class="h-5 w-5 text-gray-400 group-hover:text-green-600 transition-colors" />
                </div>
              </button>
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
              <button
                v-for="action in internalActions"
                :key="action.id"
                @click="action.action"
                class="w-full p-4 border-2 border-blue-200 bg-white rounded-lg text-left transition-all hover:border-blue-400 hover:bg-blue-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 group"
                :class="{ 'ring-2 ring-blue-500 border-blue-400 bg-blue-50': activeTab === action.tabId }"
              >
                <div class="flex items-center space-x-3">
                  <div class="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <component :is="action.icon" class="h-5 w-5 text-blue-600" />
                  </div>
                  <div class="flex-1">
                    <h3 class="font-medium text-gray-900">{{ action.label }}</h3>
                    <p class="text-sm text-muted-foreground">{{ action.description }}</p>
                  </div>
                  <ChevronRight class="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Management Tabs -->
      <div ref="tabSectionRef" class="scroll-mt-6">
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
              @click="activeTab = tab.id as TabId"
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

        <CardContent class="p-6 min-h-[400px]">
          <!-- Overview Tab -->
          <div v-show="activeTab === 'overview'" class="space-y-6">
            <!-- Quick Stats -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader class="pb-2">
                  <CardTitle class="text-sm font-medium text-muted-foreground">Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant="outline" class="text-sm">{{ project?.status }}</Badge>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader class="pb-2">
                  <CardTitle class="text-sm font-medium text-muted-foreground">Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div class="flex items-center gap-2">
                    <div class="w-full bg-muted rounded-full h-3">
                      <div 
                        class="h-3 rounded-full transition-all duration-500 bg-primary"
                        :style="{ width: `${projectProgress}%` }"
                      ></div>
                    </div>
                    <span class="text-sm font-medium">{{ projectProgress }}%</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader class="pb-2">
                  <CardTitle class="text-sm font-medium text-muted-foreground">Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <p class="text-sm">{{ formatProjectType(project?.type) }}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader class="pb-2">
                  <CardTitle class="text-sm font-medium text-muted-foreground">Client</CardTitle>
                </CardHeader>
                <CardContent>
                  <p class="text-sm">{{ project?.client?.name || project?.client?.email }}</p>
                </CardContent>
              </Card>
            </div>

            <!-- Management Overview -->
            <Card>
              <CardHeader>
                <CardTitle>Project Management Overview</CardTitle>
                <CardDescription>
                  Use the tabs above to manage different aspects of this project. Each section provides tools to update content visible to the client.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div class="space-y-4">
                  <Alert>
                    <MessageSquare class="h-4 w-4" />
                    <AlertTitle>Getting Started</AlertTitle>
                    <AlertDescription>
                      <ul class="list-disc list-inside space-y-1 text-sm">
                        <li><strong>Project Updates:</strong> Post progress updates that clients can see</li>
                        <li><strong>Deliverables:</strong> Upload and manage project deliverables</li>
                        <li><strong>Comments:</strong> View and respond to client questions</li>
                        <li><strong>Progress Tracking:</strong> Update internal milestones (not visible to clients)</li>
                        <li><strong>File Management:</strong> Manage project files and assets</li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                  
                  <div class="pt-4">
                    <Button 
                      @click="$router.push(`/admin/projects/${projectId}`)"
                      variant="outline"
                      class="w-full"
                    >
                      <FileText class="h-4 w-4 mr-2" />
                      View Full Project Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <!-- Updates Tab -->
          <div v-show="activeTab === 'updates'" class="min-h-[300px]">
            <AdminProjectUpdates 
              v-if="initializedTabs.updates"
              :project-id="projectId" 
              :trigger-create="triggerUpdateForm" 
            />
            <div v-else class="flex items-center justify-center h-[300px]">
              <div class="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
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
              <div class="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
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
              <div class="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          </div>

          <!-- Comments Tab -->
          <div v-show="activeTab === 'comments'" class="min-h-[300px]">
            <AdminProjectComments 
              v-if="initializedTabs.comments"
              :project-id="projectId" 
            />
            <div v-else class="flex items-center justify-center h-[300px]">
              <div class="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          </div>

          <!-- Files Tab -->
          <div v-show="activeTab === 'files'" class="min-h-[300px]">
            <AdminProjectFiles 
              v-if="initializedTabs.files"
              :project-id="projectId" 
            />
            <div v-else class="flex items-center justify-center h-[300px]">
              <div class="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  </div>
</template>
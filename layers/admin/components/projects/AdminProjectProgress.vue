<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { Plus, CheckCircle, Clock, Circle, Settings, Trash2, Edit3, Lock, AlertCircle } from "lucide-vue-next";
import { useToast } from "@/components/ui/toast/use-toast";
import type { PROJECT_PHASES } from "~/server/utils/project-phases";

interface Props {
  projectId: string;
  triggerCreate?: boolean;
}

interface Phase {
  id: string;
  name: string;
  description: string;
  defaultWeight: number;
  order: number;
}

interface PhaseProgress {
  progress: number;
  milestones: Array<{
    id: string;
    name: string;
    status: string;
    phase?: string | null;
    weight: number;
  }>;
}

const props = defineProps<Props>();

// Watch for trigger to open create form
watch(() => props.triggerCreate, (newValue) => {
  if (newValue) {
    showCreateForm.value = true;
  }
});
const { toast } = useToast();

// Form state
const showCreateForm = ref(false);
const editingMilestone = ref<any>(null);
const isSubmitting = ref(false);

// Delete dialog state
const deleteDialog = ref({
  open: false,
  milestoneId: "",
  milestoneName: "",
  loading: false
});

const newMilestone = ref({
  name: "",
  description: "",
  targetDate: "",
  status: "pending" as "pending" | "in_progress" | "completed",
  order: 0,
  phase: "",
  weight: 1
});

// Fetch project progress
const { data: progressData, refresh: refreshProgress } = await useFetch(`/api/admin/projects/${props.projectId}/progress`, {
  server: false
});

const project = computed(() => progressData.value?.project || {} as { progress?: number; calculatedProgress?: number; currentPhase?: string });
const milestones = computed(() => progressData.value?.milestones || []);
const phases = computed<Record<string, Phase>>(() => progressData.value?.phases || {});
const phaseProgress = computed<Record<string, PhaseProgress>>(() => progressData.value?.phaseProgress || {});

// Use calculated hybrid progress
const overallProgress = computed(() => {
  return project.value.calculatedProgress || 0;
});

// Milestone status options
const statusOptions = [
  { value: "pending", label: "Pending", color: "text-gray-600 bg-gray-50 border-gray-200", icon: Circle },
  { value: "in_progress", label: "In Progress", color: "text-blue-600 bg-blue-50 border-blue-200", icon: Clock },
  { value: "completed", label: "Completed", color: "text-green-600 bg-green-50 border-green-200", icon: CheckCircle }
];

// Create milestone
const createMilestone = async () => {
  if (!newMilestone.value.name.trim()) {
    toast({
      title: "Error",
      description: "Milestone name is required",
      variant: "destructive"
    });
    return;
  }

  isSubmitting.value = true;

  try {
    const response = await $fetch(`/api/admin/projects/${props.projectId}/milestones`, {
      method: "POST",
      body: {
        name: newMilestone.value.name,
        description: newMilestone.value.description,
        targetDate: newMilestone.value.targetDate || null,
        status: newMilestone.value.status,
        order: milestones.value.length,
        phase: newMilestone.value.phase || null,
        weight: newMilestone.value.weight
      }
    });

    if (response.success) {
      toast({
        title: "Success",
        description: "Milestone created successfully"
      });

      // Reset form
      newMilestone.value = {
        name: "",
        description: "",
        targetDate: "",
        status: "pending",
        order: 0,
        phase: "",
        weight: 1
      };
      showCreateForm.value = false;
      
      // Refresh progress
      await refreshProgress();
    }
  } catch (error: any) {
    toast({
      title: "Error",
      description: error?.data?.message || "Failed to create milestone",
      variant: "destructive"
    });
  } finally {
    isSubmitting.value = false;
  }
};

// Update milestone status
const updateMilestoneStatus = async (milestoneId: string, status: string) => {
  try {
    const response = await $fetch(`/api/admin/projects/${props.projectId}/milestones/${milestoneId}`, {
      method: "PATCH",
      body: { status }
    });

    if (response.success) {
      toast({
        title: "Success",
        description: "Milestone status updated"
      });
      await refreshProgress();
    }
  } catch (error: any) {
    toast({
      title: "Error",
      description: error?.data?.message || "Failed to update milestone",
      variant: "destructive"
    });
  }
};

// Update overall project progress
const updateProjectProgress = async (progress: number) => {
  try {
    const response = await $fetch(`/api/admin/projects/${props.projectId}/progress`, {
      method: "PATCH",
      body: { progress }
    });

    if (response.success) {
      toast({
        title: "Success",
        description: "Project progress updated"
      });
      await refreshProgress();
    }
  } catch (error: any) {
    toast({
      title: "Error",
      description: error?.data?.message || "Failed to update project progress",
      variant: "destructive"
    });
  }
};

// Open delete dialog
const openDeleteDialog = (milestone: any) => {
  deleteDialog.value = {
    open: true,
    milestoneId: milestone.id,
    milestoneName: milestone.name,
    loading: false
  };
};

// Delete milestone
const deleteMilestone = async () => {
  deleteDialog.value.loading = true;

  try {
    const response = await $fetch(`/api/admin/projects/${props.projectId}/milestones/${deleteDialog.value.milestoneId}`, {
      method: "DELETE"
    });

    if (response.success) {
      toast({
        title: "Success",
        description: "Milestone deleted successfully"
      });
      deleteDialog.value.open = false;
      await refreshProgress();
    }
  } catch (error: any) {
    toast({
      title: "Error",
      description: error?.data?.message || "Failed to delete milestone",
      variant: "destructive"
    });
  } finally {
    deleteDialog.value.loading = false;
  }
};

// Format date
const formatDate = (date: string | Date): string => {
  if (!date) return "";
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};

// Get status info
const getStatusInfo = (status: string) => {
  const statusOption = statusOptions.find(s => s.value === status);
  return statusOption || statusOptions[0];
};

// Start editing milestone
const startEditMilestone = (milestone: any) => {
  editingMilestone.value = { ...milestone };
};

// Save edited milestone
const saveEditedMilestone = async () => {
  if (!editingMilestone.value?.name.trim()) {
    toast({
      title: "Error",
      description: "Milestone name is required",
      variant: "destructive"
    });
    return;
  }

  try {
    const response = await $fetch(`/api/admin/projects/${props.projectId}/milestones/${editingMilestone.value.id}`, {
      method: "PATCH",
      body: {
        name: editingMilestone.value.name,
        description: editingMilestone.value.description,
        targetDate: editingMilestone.value.targetDate || null,
        status: editingMilestone.value.status,
        phase: editingMilestone.value.phase || null,
        weight: editingMilestone.value.weight || 1
      }
    });

    if (response.success) {
      toast({
        title: "Success",
        description: "Milestone updated successfully"
      });
      editingMilestone.value = null;
      await refreshProgress();
    }
  } catch (error: any) {
    toast({
      title: "Error",
      description: error?.data?.message || "Failed to update milestone",
      variant: "destructive"
    });
  }
};
</script>

<template>
  <div class="space-y-6">
    <!-- Header with Overall Progress -->
    <div class="space-y-4">
      <Alert class="bg-blue-50 border-blue-200">
        <Lock class="h-4 w-4 text-blue-600" />
        <AlertTitle class="text-blue-800">Internal Tracking Only</AlertTitle>
        <AlertDescription class="text-blue-700">
          This progress tracking is for internal project management only. Clients cannot see these milestones or progress updates.
        </AlertDescription>
      </Alert>
      
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-lg font-semibold">Internal Project Progress</h3>
          <p class="text-sm text-muted-foreground">
            Track milestones for internal team coordination
          </p>
        </div>
        <Button @click="showCreateForm = true" class="flex items-center">
          <Plus class="h-4 w-4 mr-2" />
          Add Internal Milestone
        </Button>
      </div>

      <!-- Progress Overview Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- Overall Progress Card -->
        <Card class="border-blue-200 bg-blue-50/30">
          <CardContent class="pt-6">
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <Lock class="h-4 w-4 text-blue-600" />
                  <h4 class="font-medium">Internal Progress Overview</h4>
                </div>
                <span class="text-2xl font-bold text-blue-600">{{ overallProgress }}%</span>
              </div>
              
              <div class="w-full bg-muted rounded-full h-3">
                <div 
                  class="h-3 rounded-full transition-all duration-500 bg-primary"
                  :style="{ width: `${overallProgress}%` }"
                ></div>
              </div>
              
              <div class="flex items-center justify-between text-sm">
                <span class="text-muted-foreground">
                  Current Phase: {{ project.currentPhase ? Object.values(phases).find(p => p.id === project.currentPhase)?.name : 'Not Started' }}
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  @click="updateProjectProgress(overallProgress)"
                  :disabled="false"
                  class="border-blue-200 hover:bg-blue-50"
                >
                  <Settings class="h-4 w-4 mr-1" />
                  Sync to Client
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <!-- Phase Breakdown -->
        <Card class="border-blue-200 bg-blue-50/30">
          <CardHeader>
            <CardTitle class="text-base flex items-center gap-2">
              <Lock class="h-4 w-4 text-blue-600" />
              Phase Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-3">
              <div v-for="phase in Object.values(phases)" :key="phase.id" class="space-y-1">
                <div class="flex justify-between items-center">
                  <span class="text-sm font-medium">{{ phase.name }}</span>
                  <span class="text-xs text-muted-foreground">
                    {{ phaseProgress[phase.id]?.progress || 0 }}% ({{ phaseProgress[phase.id]?.milestones?.filter(m => m.status === 'completed').length || 0 }}/{{ phaseProgress[phase.id]?.milestones?.length || 0 }})
                  </span>
                </div>
                <div class="w-full bg-muted rounded-full h-2">
                  <div 
                    class="h-2 rounded-full transition-all duration-500 bg-primary"
                    :style="{ width: `${phaseProgress[phase.id]?.progress || 0}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- Create Milestone Form -->
    <Card v-if="showCreateForm" class="border-blue-200">
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <Lock class="h-5 w-5 text-blue-600" />
          Create Internal Milestone
        </CardTitle>
        <CardDescription>
          Add a milestone for internal tracking (not visible to clients)
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="name">Milestone Name</Label>
            <Input
              id="name"
              v-model="newMilestone.name"
              placeholder="e.g., Design Approval"
            />
          </div>

          <div class="space-y-2">
            <Label for="phase">Project Phase</Label>
            <Select v-model="newMilestone.phase">
              <SelectTrigger>
                <SelectValue placeholder="Select phase" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="phase in Object.values(phases)" :key="phase.id" :value="phase.id">
                  {{ phase.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="status">Status</Label>
            <Select v-model="newMilestone.status">
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="status in statusOptions" :key="status.value" :value="status.value">
                  {{ status.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label for="weight">Weight (Importance)</Label>
            <Input
              id="weight"
              v-model.number="newMilestone.weight"
              type="number"
              min="1"
              max="10"
              placeholder="1-10"
            />
          </div>
        </div>

        <div class="space-y-2">
          <Label for="description">Description</Label>
          <Textarea
            id="description"
            v-model="newMilestone.description"
            placeholder="Describe what needs to be completed..."
            rows="3"
          />
        </div>

        <div class="space-y-2">
          <Label for="target-date">Target Date (Optional)</Label>
          <Input
            id="target-date"
            v-model="newMilestone.targetDate"
            type="date"
          />
        </div>

        <div class="flex justify-end space-x-2">
          <Button variant="outline" @click="showCreateForm = false">
            Cancel
          </Button>
          <Button @click="createMilestone" :disabled="isSubmitting">
            <span v-if="isSubmitting">Creating...</span>
            <span v-else>Create Milestone</span>
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- Milestones List -->
    <div class="space-y-4">
      <div v-if="milestones.length === 0" class="text-center py-8 border border-dashed rounded-lg">
        <Circle class="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
        <h3 class="font-medium text-muted-foreground">No milestones yet</h3>
        <p class="text-sm text-muted-foreground mt-1">
          Create milestones to track detailed progress. Client currently sees {{ overallProgress }}% based on project status.
        </p>
        <Alert class="mt-4 text-left max-w-2xl mx-auto">
          <AlertCircle class="h-4 w-4" />
          <AlertTitle>Quick Start</AlertTitle>
          <AlertDescription>
            Start with Discovery phase milestones like "Requirements Gathering", "Scope Definition", and "Timeline Planning" to show granular progress to your client.
          </AlertDescription>
        </Alert>
        <Button @click="showCreateForm = true" variant="outline" class="mt-4">
          <Plus class="h-4 w-4 mr-2" />
          Add First Milestone
        </Button>
      </div>

      <Card v-for="(milestone, index) in milestones" :key="milestone.id">
        <CardContent class="pt-6">
          <div v-if="editingMilestone?.id === milestone.id" class="space-y-4">
            <!-- Edit Form -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="edit-name">Milestone Name</Label>
                <Input
                  id="edit-name"
                  v-model="editingMilestone.name"
                />
              </div>

              <div class="space-y-2">
                <Label for="edit-status">Status</Label>
                <Select v-model="editingMilestone.status">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="status in statusOptions" :key="status.value" :value="status.value">
                      {{ status.label }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div class="space-y-2">
              <Label for="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                v-model="editingMilestone.description"
                rows="3"
              />
            </div>

            <div class="space-y-2">
              <Label for="edit-target-date">Target Date</Label>
              <Input
                id="edit-target-date"
                v-model="editingMilestone.targetDate"
                type="date"
              />
            </div>

            <div class="flex justify-end space-x-2">
              <Button variant="outline" @click="editingMilestone = null">
                Cancel
              </Button>
              <Button @click="saveEditedMilestone">
                Save Changes
              </Button>
            </div>
          </div>

          <div v-else class="flex items-start justify-between">
            <div class="flex items-start space-x-3 flex-1">
              <div class="flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-medium"
                   :class="milestone.status === 'completed' ? 'bg-green-50 border-green-200 text-green-700' : 
                           milestone.status === 'in_progress' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                           'bg-gray-50 border-gray-200 text-gray-700'">
                {{ index + 1 }}
              </div>
              
              <div class="flex-1">
                <h4 class="font-medium">{{ milestone.name }}</h4>
                <p class="text-sm text-muted-foreground mt-1">{{ milestone.description }}</p>
                
                <div class="flex items-center space-x-4 mt-3">
                  <Badge :class="getStatusInfo(milestone.status).color" variant="outline">
                    <component :is="getStatusInfo(milestone.status).icon" class="h-3 w-3 mr-1" />
                    {{ getStatusInfo(milestone.status).label }}
                  </Badge>
                  
                  <Badge v-if="milestone.phase" variant="outline" class="text-blue-600 bg-blue-50 border-blue-200">
                    {{ Object.values(phases).find(p => p.id === milestone.phase)?.name || milestone.phase }}
                  </Badge>
                  
                  <span v-if="milestone.weight > 1" class="text-xs text-muted-foreground">
                    Weight: {{ milestone.weight }}
                  </span>
                  
                  <span v-if="milestone.targetDate" class="text-xs text-muted-foreground">
                    Target: {{ formatDate(milestone.targetDate) }}
                  </span>
                  
                  <span v-if="milestone.completedAt" class="text-xs text-green-600">
                    Completed: {{ formatDate(milestone.completedAt) }}
                  </span>
                </div>
              </div>
            </div>

            <div class="flex items-center space-x-2">
              <!-- Status Quick Actions -->
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings class="h-4 w-4 mr-1" />
                    Status
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem 
                    v-for="status in statusOptions" 
                    :key="status.value"
                    @click="updateMilestoneStatus(milestone.id, status.value)"
                    :class="milestone.status === status.value ? 'bg-muted' : ''"
                  >
                    <component :is="status.icon" class="h-4 w-4 mr-2" />
                    {{ status.label }}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="outline" size="sm" @click="startEditMilestone(milestone)">
                <Edit3 class="h-4 w-4" />
              </Button>
              
              <Button variant="outline" size="sm" @click="openDeleteDialog(milestone)">
                <Trash2 class="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    
    <!-- Delete Confirmation Dialog -->
    <DeleteConfirmDialog
      v-model:open="deleteDialog.open"
      title="Delete Milestone"
      :description="`This milestone will be permanently removed from the project. This action cannot be undone.`"
      :item-name="deleteDialog.milestoneName"
      :loading="deleteDialog.loading"
      @confirm="deleteMilestone"
    />
  </div>
</template>
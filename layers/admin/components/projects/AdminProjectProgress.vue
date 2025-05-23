<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { Plus, CheckCircle, Clock, Circle, Settings, Trash2, Edit3 } from "lucide-vue-next";
import { useToast } from "@/components/ui/toast/use-toast";

interface Props {
  projectId: string;
  triggerCreate?: boolean;
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

const newMilestone = ref({
  name: "",
  description: "",
  targetDate: "",
  status: "pending" as "pending" | "in_progress" | "completed",
  order: 0
});

// Fetch project progress
const { data: progressData, refresh: refreshProgress } = await useFetch(`/api/admin/projects/${props.projectId}/progress`, {
  server: false
});

const project = computed(() => progressData.value?.project || {} as { progress?: number });
const milestones = computed(() => progressData.value?.milestones || []);

// Calculate overall progress
const overallProgress = computed(() => {
  if (milestones.value.length === 0) return 0;
  const completedCount = milestones.value.filter((m: any) => m.status === 'completed').length;
  return Math.round((completedCount / milestones.value.length) * 100);
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
        order: milestones.value.length
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
        order: 0
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

// Delete milestone
const deleteMilestone = async (milestoneId: string) => {
  if (!confirm("Are you sure you want to delete this milestone?")) return;

  try {
    const response = await $fetch(`/api/admin/projects/${props.projectId}/milestones/${milestoneId}`, {
      method: "DELETE"
    });

    if (response.success) {
      toast({
        title: "Success",
        description: "Milestone deleted successfully"
      });
      await refreshProgress();
    }
  } catch (error: any) {
    toast({
      title: "Error",
      description: error?.data?.message || "Failed to delete milestone",
      variant: "destructive"
    });
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
        status: editingMilestone.value.status
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
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-lg font-semibold">Project Progress</h3>
          <p class="text-sm text-muted-foreground">
            Manage milestones and track project completion
          </p>
        </div>
        <Button @click="showCreateForm = true" class="flex items-center">
          <Plus class="h-4 w-4 mr-2" />
          Add Milestone
        </Button>
      </div>

      <!-- Overall Progress Card -->
      <Card>
        <CardContent class="pt-6">
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <h4 class="font-medium">Overall Progress</h4>
              <span class="text-2xl font-bold text-primary">{{ overallProgress }}%</span>
            </div>
            
            <Progress :value="overallProgress" class="h-3" />
            
            <div class="flex justify-between text-sm text-muted-foreground">
              <span>{{ milestones.filter(m => m.status === 'completed').length }} of {{ milestones.length }} milestones completed</span>
              <Button 
                variant="outline" 
                size="sm" 
                @click="updateProjectProgress(overallProgress)"
                :disabled="false"
              >
                <Settings class="h-4 w-4 mr-1" />
                Sync Progress
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Create Milestone Form -->
    <Card v-if="showCreateForm">
      <CardHeader>
        <CardTitle>Create New Milestone</CardTitle>
        <CardDescription>
          Add a milestone to track project progress
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
          Create your first milestone to start tracking progress
        </p>
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
              
              <Button variant="outline" size="sm" @click="deleteMilestone(milestone.id)">
                <Trash2 class="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
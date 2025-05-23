<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { Plus, MessageSquare, Calendar, User, Edit, Trash2, Eye } from "lucide-vue-next";
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
const isSubmitting = ref(false);

const newUpdate = ref({
  message: "",
  type: "progress" as "progress" | "milestone" | "feedback" | "general",
  author: "Project Manager",
  authorRole: "Project Manager"
});

// Fetch project updates
const { data: updatesData, error: updatesError, refresh: refreshUpdates } = await useFetch(`/api/admin/projects/${props.projectId}/updates`, {
  server: false,
  default: () => ({ updates: [] })
});

const updates = computed(() => updatesData.value?.updates || []);

// Update types
const updateTypes = [
  { value: "progress", label: "Progress Update", color: "text-blue-600" },
  { value: "milestone", label: "Milestone", color: "text-green-600" },
  { value: "feedback", label: "Client Feedback", color: "text-purple-600" },
  { value: "general", label: "General Update", color: "text-gray-600" }
];

// Team member options
const teamMembers = [
  { value: "Project Manager", role: "Project Manager" },
  { value: "Lead Developer", role: "Lead Developer" },
  { value: "Designer", role: "Designer" },
  { value: "QA Tester", role: "QA Tester" }
];

// Create new update
const createUpdate = async () => {
  if (!newUpdate.value.message.trim()) {
    toast({
      title: "Error",
      description: "Update message is required",
      variant: "destructive"
    });
    return;
  }

  isSubmitting.value = true;

  try {
    const response = await $fetch(`/api/admin/projects/${props.projectId}/updates`, {
      method: "POST",
      body: {
        message: newUpdate.value.message,
        type: newUpdate.value.type,
        author: newUpdate.value.author,
        authorRole: newUpdate.value.authorRole
      }
    });

    if (response.success) {
      toast({
        title: "Success",
        description: "Project update created successfully"
      });

      // Reset form
      newUpdate.value = {
        message: "",
        type: "progress",
        author: "Project Manager",
        authorRole: "Project Manager"
      };
      showCreateForm.value = false;
      
      // Refresh updates list
      await refreshUpdates();
    }
  } catch (error: any) {
    toast({
      title: "Error",
      description: error?.data?.message || "Failed to create update",
      variant: "destructive"
    });
  } finally {
    isSubmitting.value = false;
  }
};

// Delete update
const deleteUpdate = async (updateId: string) => {
  if (!confirm("Are you sure you want to delete this update?")) return;

  try {
    const response = await fetch(`/api/admin/projects/${props.projectId}/updates/${updateId}`, {
      method: "DELETE"
    }).then(res => res.json()) as { success: boolean };

    if (response.success) {
      toast({
        title: "Success",
        description: "Update deleted successfully"
      });
      await refreshUpdates();
    }
  } catch (error: any) {
    toast({
      title: "Error", 
      description: error?.data?.message || "Failed to delete update",
      variant: "destructive"
    });
  }
};

// Format date
const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short", 
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

// Get update type info
const getUpdateTypeInfo = (type: string) => {
  return updateTypes.find(t => t.value === type) || updateTypes[0];
};
</script>

<template>
  <div class="space-y-6">
    <!-- Client Visibility Notice -->
    <Alert class="bg-green-50 border-green-200">
      <Eye class="h-4 w-4 text-green-600" />
      <AlertTitle class="text-green-800">Client-Visible Content</AlertTitle>
      <AlertDescription class="text-green-700">
        Updates posted here will be visible to the client in their project dashboard. Ensure all content is professional and client-appropriate.
      </AlertDescription>
    </Alert>
    
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-lg font-semibold">Client-Facing Updates</h3>
        <p class="text-sm text-muted-foreground">
          Post updates that clients will see on their dashboard
        </p>
      </div>
      <Button @click="showCreateForm = true" class="flex items-center">
        <Plus class="h-4 w-4 mr-2" />
        Add Client Update
      </Button>
    </div>

    <!-- Create Update Form -->
    <Card v-if="showCreateForm" class="border-green-200">
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <Eye class="h-5 w-5 text-green-600" />
          Create Client Update
        </CardTitle>
        <CardDescription>
          This update will be immediately visible to the client
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="update-type">Update Type</Label>
            <Select v-model="newUpdate.type">
              <SelectTrigger>
                <SelectValue placeholder="Select update type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="type in updateTypes" :key="type.value" :value="type.value">
                  {{ type.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label for="author">Team Member</Label>
            <Select v-model="newUpdate.author" @update:model-value="(value) => {
              const member = teamMembers.find(m => m.value === value);
              if (member) {
                newUpdate.author = member.value;
                newUpdate.authorRole = member.role;
              }
            }">
              <SelectTrigger>
                <SelectValue placeholder="Select team member" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="member in teamMembers" :key="member.value" :value="member.value">
                  {{ member.value }} ({{ member.role }})
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div class="space-y-2">
          <Label for="message">Update Message</Label>
          <Textarea
            id="message"
            v-model="newUpdate.message"
            placeholder="Enter the update message that clients will see..."
            rows="4"
          />
        </div>

        <div class="flex justify-end space-x-2">
          <Button variant="outline" @click="showCreateForm = false">
            Cancel
          </Button>
          <Button @click="createUpdate" :disabled="isSubmitting">
            <span v-if="isSubmitting">Creating...</span>
            <span v-else>Create Update</span>
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- Updates List -->
    <div class="space-y-4">
      <div v-if="updates.length === 0" class="text-center py-8 border border-dashed rounded-lg">
        <MessageSquare class="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
        <h3 class="font-medium text-muted-foreground">No updates yet</h3>
        <p class="text-sm text-muted-foreground mt-1">
          Create your first project update to keep clients informed
        </p>
        <Button @click="showCreateForm = true" variant="outline" class="mt-4">
          <Plus class="h-4 w-4 mr-2" />
          Add First Update
        </Button>
      </div>

      <Card v-for="update in updates" :key="update.id" class="relative">
        <CardContent class="pt-6">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center space-x-2 mb-2">
                <Badge :class="getUpdateTypeInfo(update.type).color" variant="outline">
                  {{ getUpdateTypeInfo(update.type).label }}
                </Badge>
                <span class="text-sm text-muted-foreground">
                  by {{ update.author }}
                </span>
              </div>
              
              <p class="text-sm">{{ update.message }}</p>
              
              <div class="flex items-center text-xs text-muted-foreground mt-3">
                <Calendar class="h-3 w-3 mr-1" />
                {{ formatDate(update.createdAt) }}
                <User class="h-3 w-3 ml-4 mr-1" />
                {{ update.authorRole }}
              </div>
            </div>

            <div class="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Edit class="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" @click="deleteUpdate(update.id)">
                <Trash2 class="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
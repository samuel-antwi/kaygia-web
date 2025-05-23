<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { Plus, Upload, Eye, Download, FileText, Image, ExternalLink, CheckCircle, Clock, XCircle } from "lucide-vue-next";
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
const uploadProgress = ref(0);

const newDeliverable = ref({
  name: "",
  description: "",
  type: "file" as "file" | "link" | "preview",
  fileType: "pdf" as "pdf" | "image" | "doc" | "link",
  url: "",
  file: null as File | null
});

// Fetch deliverables
const { data: deliverablesData, refresh: refreshDeliverables } = await useFetch(`/api/admin/projects/${props.projectId}/deliverables`, {
  server: false
});

const deliverables = computed(() => deliverablesData.value?.deliverables || []);

// Deliverable types
const deliverableTypes = [
  { value: "file", label: "File Upload", description: "Upload a file for client download" },
  { value: "preview", label: "Preview/Mockup", description: "Visual preview or design mockup" },
  { value: "link", label: "External Link", description: "Link to staging site or external resource" }
];

const fileTypes = [
  { value: "pdf", label: "PDF Document", icon: FileText },
  { value: "image", label: "Image/Design", icon: Image },
  { value: "doc", label: "Document", icon: FileText },
  { value: "link", label: "Web Link", icon: ExternalLink }
];

// Handle file selection
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    newDeliverable.value.file = file;
    newDeliverable.value.name = newDeliverable.value.name || file.name.split('.')[0];
    
    // Auto-detect file type
    if (file.type.startsWith('image/')) {
      newDeliverable.value.fileType = 'image';
    } else if (file.type.includes('pdf')) {
      newDeliverable.value.fileType = 'pdf';
    } else {
      newDeliverable.value.fileType = 'doc';
    }
  }
};

// Create deliverable
const createDeliverable = async () => {
  if (!newDeliverable.value.name.trim()) {
    toast({
      title: "Error",
      description: "Deliverable name is required",
      variant: "destructive"
    });
    return;
  }

  if (newDeliverable.value.type === "file" && !newDeliverable.value.file) {
    toast({
      title: "Error", 
      description: "Please select a file to upload",
      variant: "destructive"
    });
    return;
  }

  if (newDeliverable.value.type === "link" && !newDeliverable.value.url) {
    toast({
      title: "Error",
      description: "URL is required for link deliverables", 
      variant: "destructive"
    });
    return;
  }

  isSubmitting.value = true;

  try {
    let fileId = null;

    // If uploading a file, upload it first
    if (newDeliverable.value.type === "file" && newDeliverable.value.file) {
      const formData = new FormData();
      formData.append("file", newDeliverable.value.file);

      const uploadResponse = await $fetch(`/api/admin/projects/${props.projectId}/files/upload`, {
        method: "POST",
        body: formData
      });

      if (uploadResponse.success) {
        fileId = uploadResponse.files[0]?.id;
      }
    }

    // Create deliverable record
    const response = await $fetch(`/api/admin/projects/${props.projectId}/deliverables`, {
      method: "POST",
      body: {
        name: newDeliverable.value.name,
        description: newDeliverable.value.description,
        type: newDeliverable.value.type,
        fileType: newDeliverable.value.fileType,
        url: newDeliverable.value.type === "link" ? newDeliverable.value.url : null,
        fileId: fileId,
        status: "ready" // Ready for client review
      }
    });

    if (response.success) {
      toast({
        title: "Success",
        description: "Deliverable created successfully"
      });

      // Reset form
      newDeliverable.value = {
        name: "",
        description: "",
        type: "file",
        fileType: "pdf", 
        url: "",
        file: null
      };
      showCreateForm.value = false;
      
      // Refresh deliverables
      await refreshDeliverables();
    }
  } catch (error: any) {
    toast({
      title: "Error",
      description: error?.data?.message || "Failed to create deliverable",
      variant: "destructive"
    });
  } finally {
    isSubmitting.value = false;
  }
};

// Format date
const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};

// Get status info
const getStatusInfo = (status: string) => {
  switch (status) {
    case "ready":
      return { label: "Ready for Review", color: "text-blue-600 bg-blue-50 border-blue-200", icon: Clock };
    case "approved":
      return { label: "Approved", color: "text-green-600 bg-green-50 border-green-200", icon: CheckCircle };
    case "rejected":
      return { label: "Needs Changes", color: "text-red-600 bg-red-50 border-red-200", icon: XCircle };
    default:
      return { label: "Pending", color: "text-gray-600 bg-gray-50 border-gray-200", icon: Clock };
  }
};

// Get file type icon
const getFileTypeIcon = (fileType?: string | null) => {
  const type = fileTypes.find(t => t.value === fileType);
  return type?.icon || FileText;
};
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-lg font-semibold">Project Deliverables</h3>
        <p class="text-sm text-muted-foreground">
          Upload files, previews, and links for client review and approval
        </p>
      </div>
      <Button @click="showCreateForm = true" class="flex items-center">
        <Plus class="h-4 w-4 mr-2" />
        Add Deliverable
      </Button>
    </div>

    <!-- Create Deliverable Form -->
    <Card v-if="showCreateForm">
      <CardHeader>
        <CardTitle>Create New Deliverable</CardTitle>
        <CardDescription>
          Upload files or links that clients can review and approve
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="name">Deliverable Name</Label>
            <Input
              id="name"
              v-model="newDeliverable.name"
              placeholder="e.g., Homepage Wireframes"
            />
          </div>

          <div class="space-y-2">
            <Label for="type">Type</Label>
            <Select v-model="newDeliverable.type">
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="type in deliverableTypes" :key="type.value" :value="type.value">
                  {{ type.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div class="space-y-2">
          <Label for="description">Description</Label>
          <Textarea
            id="description"
            v-model="newDeliverable.description"
            placeholder="Describe what this deliverable contains..."
            rows="3"
          />
        </div>

        <!-- File Upload (for file type) -->
        <div v-if="newDeliverable.type === 'file'" class="space-y-2">
          <Label for="file">Upload File</Label>
          <div class="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
            <div class="text-center">
              <Upload class="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
              <div class="space-y-2">
                <p class="text-sm text-muted-foreground">
                  Drop files here or click to browse
                </p>
                <input
                  type="file"
                  @change="handleFileSelect"
                  class="hidden"
                  id="file-input"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.gif,.svg"
                />
                <Button variant="outline" size="sm" @click="$el.querySelector('#file-input')?.click()">
                  Choose File
                </Button>
              </div>
              <div v-if="newDeliverable.file" class="mt-2 text-sm text-muted-foreground">
                Selected: {{ newDeliverable.file.name }}
              </div>
            </div>
          </div>
        </div>

        <!-- URL Input (for link/preview type) -->
        <div v-if="newDeliverable.type === 'link' || newDeliverable.type === 'preview'" class="space-y-2">
          <Label for="url">URL</Label>
          <Input
            id="url"
            v-model="newDeliverable.url"
            placeholder="https://example.com"
            type="url"
          />
        </div>

        <div class="space-y-2">
          <Label for="file-type">Display Type</Label>
          <Select v-model="newDeliverable.fileType">
            <SelectTrigger>
              <SelectValue placeholder="Select display type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="type in fileTypes" :key="type.value" :value="type.value">
                {{ type.label }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="flex justify-end space-x-2">
          <Button variant="outline" @click="showCreateForm = false">
            Cancel
          </Button>
          <Button @click="createDeliverable" :disabled="isSubmitting">
            <span v-if="isSubmitting">Creating...</span>
            <span v-else>Create Deliverable</span>
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- Deliverables List -->
    <div class="space-y-4">
      <div v-if="deliverables.length === 0" class="text-center py-8 border border-dashed rounded-lg">
        <Upload class="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
        <h3 class="font-medium text-muted-foreground">No deliverables yet</h3>
        <p class="text-sm text-muted-foreground mt-1">
          Upload your first deliverable for client review
        </p>
        <Button @click="showCreateForm = true" variant="outline" class="mt-4">
          <Plus class="h-4 w-4 mr-2" />
          Add First Deliverable
        </Button>
      </div>

      <Card v-for="deliverable in deliverables" :key="deliverable.id">
        <CardContent class="pt-6">
          <div class="flex items-start justify-between">
            <div class="flex items-start space-x-3 flex-1">
              <div class="p-2 bg-muted rounded-lg">
                <component :is="getFileTypeIcon(deliverable.fileType)" class="h-5 w-5 text-muted-foreground" />
              </div>
              <div class="flex-1">
                <h4 class="font-medium">{{ deliverable.name }}</h4>
                <p class="text-sm text-muted-foreground mt-1">{{ deliverable.description }}</p>
                
                <div class="flex items-center space-x-4 mt-3">
                  <Badge :class="getStatusInfo(deliverable.status).color" variant="outline">
                    <component :is="getStatusInfo(deliverable.status).icon" class="h-3 w-3 mr-1" />
                    {{ getStatusInfo(deliverable.status).label }}
                  </Badge>
                  <span class="text-xs text-muted-foreground">
                    Created {{ formatDate(deliverable.createdAt) }}
                  </span>
                  <Badge variant="secondary" class="text-xs">
                    {{ deliverable.type }}
                  </Badge>
                </div>
              </div>
            </div>

            <div class="flex items-center space-x-2">
              <Button variant="outline" size="sm" v-if="deliverable.url">
                <Eye class="h-4 w-4 mr-1" />
                {{ deliverable.type === 'link' ? 'Visit' : 'Preview' }}
              </Button>
              <Button variant="outline" size="sm" v-if="deliverable.file">
                <Download class="h-4 w-4 mr-1" />
                Download
              </Button>
            </div>
          </div>

          <!-- Approval Status -->
          <div v-if="deliverable.status === 'approved' && deliverable.approvedAt" class="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p class="text-sm text-green-800">
              ✅ Approved by client on {{ formatDate(deliverable.approvedAt) }}
            </p>
          </div>
          <div v-else-if="deliverable.status === 'rejected'" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-sm text-red-800">
              ❌ Client requested changes - check project comments for feedback
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
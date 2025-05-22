<script setup lang="ts">
import { Download, Eye, FileText, Image, Monitor, ExternalLink } from "lucide-vue-next";

interface Deliverable {
  id: string;
  name: string;
  type: 'file' | 'link' | 'preview';
  url: string;
  description?: string;
  createdAt: Date | string;
  fileType?: 'pdf' | 'image' | 'doc' | 'link';
  status: 'ready' | 'pending' | 'approved';
}

interface Props {
  projectId: string;
}

const props = defineProps<Props>();

// Fetch real deliverables from API
const { data: deliverablesData, refresh: refreshDeliverables } = await useFetch(`/api/projects/${props.projectId}/deliverables`)

const deliverables = computed(() => deliverablesData.value?.deliverables || []);

// Handle approval actions
const handleApproval = async (deliverableId: string, action: 'approve' | 'reject') => {
  try {
    await $fetch(`/api/projects/${props.projectId}/deliverables/${deliverableId}/approve`, {
      method: 'POST',
      body: { action }
    });
    
    // Refresh deliverables list
    await refreshDeliverables();
    
    // Show success message (you could use toast here)
    console.log(`Deliverable ${action}d successfully`);
  } catch (error) {
    console.error(`Error ${action}ing deliverable:`, error);
  }
};

// Format date
const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// Get file type icon
const getFileTypeIcon = (fileType?: string) => {
  switch (fileType) {
    case "pdf":
    case "doc":
      return FileText;
    case "image":
      return Image;
    case "link":
      return ExternalLink;
    default:
      return FileText;
  }
};

// Get status color
const getStatusColor = (status: string): string => {
  switch (status) {
    case "approved":
      return "text-green-600 bg-green-50 border-green-200";
    case "ready":
      return "text-blue-600 bg-blue-50 border-blue-200";
    case "pending":
      return "text-amber-600 bg-amber-50 border-amber-200";
    default:
      return "text-gray-600 bg-gray-50 border-gray-200";
  }
};

// Get status text
const getStatusText = (status: string): string => {
  switch (status) {
    case "approved":
      return "Approved";
    case "ready":
      return "Ready for Review";
    case "pending":
      return "In Progress";
    default:
      return "Unknown";
  }
};
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle class="flex items-center">
        <Monitor class="h-5 w-5 mr-2" />
        Project Deliverables
      </CardTitle>
      <CardDescription>Files, previews, and assets delivered for your project</CardDescription>
    </CardHeader>
    <CardContent>
      <div class="space-y-4">
        <div v-for="deliverable in deliverables" :key="deliverable.id" 
             class="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
          <div class="flex items-start justify-between">
            <div class="flex items-start space-x-3 flex-1">
              <div class="p-2 bg-muted rounded-lg">
                <component :is="getFileTypeIcon(deliverable.fileType || undefined)" class="h-4 w-4 text-muted-foreground" />
              </div>
              <div class="flex-1 space-y-1">
                <h4 class="font-medium">{{ deliverable.name }}</h4>
                <p class="text-sm text-muted-foreground">{{ deliverable.description }}</p>
                <div class="flex items-center space-x-2">
                  <Badge variant="outline" :class="getStatusColor(deliverable.status)">
                    {{ getStatusText(deliverable.status) }}
                  </Badge>
                  <span class="text-xs text-muted-foreground">{{ formatDate(deliverable.createdAt) }}</span>
                </div>
              </div>
            </div>
            
            <div class="flex items-center space-x-2">
              <Button v-if="deliverable.type === 'preview' || deliverable.type === 'link'" 
                      variant="outline" size="sm">
                <Eye class="h-4 w-4 mr-1" />
                {{ deliverable.type === 'link' ? 'Visit' : 'Preview' }}
              </Button>
              <Button v-if="deliverable.type === 'file'" variant="outline" size="sm">
                <Download class="h-4 w-4 mr-1" />
                Download
              </Button>
            </div>
          </div>
          
          <!-- Approval needed prompt -->
          <div v-if="deliverable.status === 'ready'" 
               class="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p class="text-sm text-blue-800 mb-2">This deliverable is ready for your review and approval.</p>
            <div class="flex space-x-2">
              <Button size="sm" variant="default" @click="handleApproval(deliverable.id, 'approve')">
                Approve
              </Button>
              <Button size="sm" variant="outline" @click="handleApproval(deliverable.id, 'reject')">
                Request Changes
              </Button>
            </div>
          </div>
        </div>
        
        <!-- Empty state -->
        <div v-if="!deliverables.length" class="text-center py-8 text-muted-foreground">
          <Monitor class="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No deliverables available yet.</p>
          <p class="text-sm">Your project team will upload files and previews here as they become ready.</p>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
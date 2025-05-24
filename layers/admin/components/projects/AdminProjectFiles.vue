<script setup lang="ts">
import { ref, computed } from "vue";
import { Upload, Download, Eye, FileText, Image, Archive, Trash2, FolderOpen, Filter, Search, Lock } from "lucide-vue-next";
import { useToast } from "@/components/ui/toast/use-toast";

interface Props {
  projectId: string;
}

const props = defineProps<Props>();
const { toast } = useToast();

// Form state
const isUploading = ref(false);
const uploadProgress = ref(0);
const selectedFiles = ref<FileList | null>(null);
const searchQuery = ref("");
const selectedCategory = ref("all");

// Delete dialog state
const deleteDialog = ref({
  open: false,
  fileId: "",
  fileName: "",
  loading: false
});

// Fetch project files
const { data: filesData, refresh: refreshFiles } = await useFetch(`/api/admin/projects/${props.projectId}/files`, {
  server: false
});

const files = computed(() => filesData.value?.files || []);

// File categories
const categories = [
  { value: "all", label: "All Files", count: files.value.length },
  { value: "image", label: "Images", count: files.value.filter((f: any) => f.type === 'image').length },
  { value: "document", label: "Documents", count: files.value.filter((f: any) => f.type === 'document').length },
  { value: "archive", label: "Archives", count: files.value.filter((f: any) => f.type === 'archive').length },
  { value: "other", label: "Other", count: files.value.filter((f: any) => f.type === 'other').length }
];

// Filtered files
const filteredFiles = computed(() => {
  let filtered = files.value;

  // Filter by category
  if (selectedCategory.value !== "all") {
    filtered = filtered.filter((file: any) => file.type === selectedCategory.value);
  }

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter((file: any) => 
      file.name.toLowerCase().includes(query) || 
      file.originalName.toLowerCase().includes(query)
    );
  }

  return filtered;
});

// Handle file selection
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  selectedFiles.value = target.files;
};

// Upload files
const uploadFiles = async () => {
  if (!selectedFiles.value || selectedFiles.value.length === 0) {
    toast({
      title: "Error",
      description: "Please select files to upload",
      variant: "destructive"
    });
    return;
  }

  isUploading.value = true;
  uploadProgress.value = 0;

  try {
    const formData = new FormData();
    Array.from(selectedFiles.value).forEach(file => {
      formData.append("files", file);
    });

    const response = await fetch(`/api/admin/projects/${props.projectId}/files/upload`, {
      method: "POST",
      body: formData,
    }).then(res => res.json()) as { success: boolean; files: any[] };

    if (response.success) {
      toast({
        title: "Success",
        description: `${response.files.length} file(s) uploaded successfully`
      });

      // Clear selection
      selectedFiles.value = null;
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      // Refresh files
      await refreshFiles();
    }
  } catch (error: any) {
    toast({
      title: "Error",
      description: error?.data?.message || "Failed to upload files",
      variant: "destructive"
    });
  } finally {
    isUploading.value = false;
    uploadProgress.value = 0;
  }
};

// Open delete dialog
const openDeleteDialog = (file: any) => {
  deleteDialog.value = {
    open: true,
    fileId: file.id,
    fileName: file.originalName || file.name,
    loading: false
  };
};

// Delete file
const deleteFile = async () => {
  deleteDialog.value.loading = true;

  try {
    const response = await fetch(`/api/admin/projects/${props.projectId}/files/${deleteDialog.value.fileId}`, {
      method: "DELETE"
    }).then(res => res.json()) as { success: boolean };

    if (response.success) {
      toast({
        title: "Success",
        description: "File deleted successfully"
      });
      deleteDialog.value.open = false;
      await refreshFiles();
    }
  } catch (error: any) {
    toast({
      title: "Error",
      description: error?.data?.message || "Failed to delete file",
      variant: "destructive"
    });
  } finally {
    deleteDialog.value.loading = false;
  }
};

// Download file
const downloadFile = async (fileId: string, fileName: string) => {
  try {
    const response = await fetch(`/api/admin/projects/${props.projectId}/files/${fileId}/download`, {
      method: "GET"
    }).then(res => res.json()) as { file: { downloadUrl: string } };

    if (response.file?.downloadUrl) {
      // Create temporary link and trigger download
      const link = document.createElement('a');
      link.href = response.file.downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  } catch (error: any) {
    toast({
      title: "Error",
      description: error?.data?.message || "Failed to download file",
      variant: "destructive"
    });
  }
};

// Get file icon
const getFileIcon = (type: string, mimeType?: string | null) => {
  if (type === 'image' || mimeType?.startsWith('image/')) {
    return Image;
  } else if (type === 'archive' || mimeType?.includes('zip') || mimeType?.includes('rar')) {
    return Archive;
  } else {
    return FileText;
  }
};

// Format file size
const formatFileSize = (bytes?: number | null): string => {
  if (!bytes) return "Unknown size";
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
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

// Get file type badge color
const getTypeBadgeColor = (type: string) => {
  switch (type) {
    case 'image':
      return 'bg-green-50 text-green-700 border-green-200';
    case 'document':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'archive':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};
</script>

<template>
  <div class="space-y-6">
    <!-- Internal Notice -->
    <Alert class="bg-blue-50 border-blue-200">
      <Lock class="h-4 w-4 text-blue-600" />
      <AlertTitle class="text-blue-800">Internal File Management</AlertTitle>
      <AlertDescription class="text-blue-700">
        These files are for internal organization only. To share files with clients, use the "Deliverables" tab instead.
      </AlertDescription>
    </Alert>
    
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-lg font-semibold">Internal Project Files</h3>
        <p class="text-sm text-muted-foreground">
          Store and organize files for internal team use
        </p>
      </div>
    </div>

    <!-- Upload Section -->
    <Card class="border-blue-200">
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <Lock class="h-5 w-5 text-blue-600" />
          Upload Internal Files
        </CardTitle>
        <CardDescription>
          Upload files for internal reference only (not visible to clients)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <!-- File Drop Zone -->
          <div class="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8">
            <div class="text-center">
              <Upload class="h-10 w-10 mx-auto text-muted-foreground/50 mb-4" />
              <div class="space-y-2">
                <p class="text-lg font-medium">Drop files here or click to browse</p>
                <p class="text-sm text-muted-foreground">
                  Supports images, documents, archives, and more
                </p>
                <input
                  ref="fileInput"
                  type="file"
                  @change="handleFileSelect"
                  class="hidden"
                  id="file-input"
                  multiple
                  accept="*/*"
                />
                <Button 
                  variant="outline" 
                  @click="($refs.fileInput as HTMLInputElement)?.click()"
                  :disabled="isUploading"
                >
                  Choose Files
                </Button>
              </div>
              
              <!-- Selected files preview -->
              <div v-if="selectedFiles && selectedFiles.length > 0" class="mt-4 p-3 bg-muted rounded-lg">
                <p class="text-sm font-medium mb-2">Selected Files:</p>
                <div class="space-y-1">
                  <div v-for="file in Array.from(selectedFiles)" :key="file.name" class="flex justify-between text-xs">
                    <span>{{ file.name }}</span>
                    <span class="text-muted-foreground">{{ formatFileSize(file.size) }}</span>
                  </div>
                </div>
              </div>

              <!-- Upload progress -->
              <div v-if="isUploading" class="mt-4">
                <Progress :value="uploadProgress" class="h-2 [&>div]:bg-blue-600" />
                <p class="text-sm text-muted-foreground mt-2">Uploading... {{ uploadProgress }}%</p>
              </div>
            </div>
          </div>

          <!-- Upload button -->
          <div class="flex justify-end">
            <Button 
              @click="uploadFiles" 
              :disabled="!selectedFiles || selectedFiles.length === 0 || isUploading"
            >
              <Upload class="h-4 w-4 mr-2" />
              <span v-if="isUploading">Uploading...</span>
              <span v-else>Upload Files</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Files Section -->
    <div class="space-y-4">
      <!-- Filters and Search -->
      <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div class="flex items-center space-x-2">
          <Filter class="h-4 w-4 text-muted-foreground" />
          <Select v-model="selectedCategory">
            <SelectTrigger class="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="category in categories" :key="category.value" :value="category.value">
                {{ category.label }} ({{ category.count }})
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="relative">
          <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            v-model="searchQuery"
            placeholder="Search files..."
            class="pl-10 w-[300px]"
          />
        </div>
      </div>

      <!-- Files Grid -->
      <div v-if="filteredFiles.length === 0" class="text-center py-12 border border-dashed rounded-lg">
        <FolderOpen class="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
        <h3 class="font-medium text-muted-foreground">
          {{ searchQuery || selectedCategory !== 'all' ? 'No files match your filters' : 'No files uploaded yet' }}
        </h3>
        <p class="text-sm text-muted-foreground mt-1">
          {{ searchQuery || selectedCategory !== 'all' ? 'Try adjusting your search or filters' : 'Upload your first file to get started' }}
        </p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card v-for="file in filteredFiles" :key="file.id" class="hover:shadow-md transition-shadow">
          <CardContent class="pt-6">
            <div class="space-y-4">
              <!-- File Icon and Info -->
              <div class="flex items-start space-x-3">
                <div class="p-2 bg-muted rounded-lg">
                  <component :is="getFileIcon(file.type, file.mimeType)" class="h-6 w-6 text-muted-foreground" />
                </div>
                <div class="flex-1 min-w-0">
                  <h4 class="font-medium truncate" :title="file.originalName">{{ file.name }}</h4>
                  <p class="text-sm text-muted-foreground truncate" :title="file.originalName">
                    {{ file.originalName }}
                  </p>
                </div>
              </div>

              <!-- File Details -->
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <Badge :class="getTypeBadgeColor(file.type)" variant="outline" class="text-xs">
                    {{ file.type }}
                  </Badge>
                  <span class="text-xs text-muted-foreground">
                    {{ formatFileSize(file.size) }}
                  </span>
                </div>
                
                <p class="text-xs text-muted-foreground">
                  Uploaded {{ formatDate(file.createdAt) }}
                </p>
              </div>

              <!-- Actions -->
              <div class="flex items-center justify-between pt-2 border-t">
                <div class="flex items-center space-x-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    @click="downloadFile(file.id, file.originalName)"
                    title="Download"
                  >
                    <Download class="h-4 w-4" />
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    v-if="file.type === 'image'"
                    title="Preview"
                  >
                    <Eye class="h-4 w-4" />
                  </Button>
                </div>

                <Button 
                  variant="ghost" 
                  size="sm" 
                  @click="openDeleteDialog(file)"
                  title="Delete"
                  class="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 class="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- Storage Usage -->
    <Card>
      <CardContent class="pt-6">
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h4 class="font-medium">Storage Usage</h4>
            <span class="text-sm text-muted-foreground">
              {{ files.length }} files
            </span>
          </div>
          
          <div class="space-y-2">
            <div class="flex justify-between text-sm">
              <span>Total Size</span>
              <span>{{ formatFileSize(files.reduce((acc: number, file: any) => acc + (file.size || 0), 0)) }}</span>
            </div>
            
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div v-for="category in categories.filter(c => c.value !== 'all')" :key="category.value">
                <div class="text-muted-foreground">{{ category.label }}</div>
                <div class="font-medium">{{ category.count }} files</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
    
    <!-- Delete Confirmation Dialog -->
    <DeleteConfirmDialog
      v-model:open="deleteDialog.open"
      title="Delete File"
      :description="`This file will be permanently removed from the project. This action cannot be undone.`"
      :item-name="deleteDialog.fileName"
      :loading="deleteDialog.loading"
      @confirm="deleteFile"
    />
  </div>
</template>
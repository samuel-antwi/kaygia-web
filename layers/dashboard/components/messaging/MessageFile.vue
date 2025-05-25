<template>
  <div
    :class="[
      'flex items-center gap-3 p-3 border rounded-lg transition-colors',
      compact ? 'p-2' : 'p-3',
      'hover:bg-muted/50 cursor-pointer'
    ]"
    @click="handleDownload"
  >
    <!-- File icon -->
    <div class="flex-shrink-0">
      <div
        :class="[
          'rounded-lg flex items-center justify-center',
          compact ? 'w-8 h-8' : 'w-10 h-10',
          getFileTypeColor(file.fileType)
        ]"
      >
        <component :is="getFileIcon(file.fileType)" :class="compact ? 'w-4 h-4' : 'w-5 h-5'" />
      </div>
    </div>

    <!-- File info -->
    <div class="flex-1 min-w-0">
      <div :class="['font-medium truncate', compact ? 'text-sm' : 'text-base']">
        {{ file.fileName }}
      </div>
      <div :class="['text-muted-foreground', compact ? 'text-xs' : 'text-sm']">
        {{ formatFileSize(file.fileSize) }}
        <span v-if="file.fileType" class="ml-2">
          {{ file.fileType.toUpperCase() }}
        </span>
      </div>
    </div>

    <!-- Download button -->
    <div class="flex-shrink-0">
      <Button
        variant="ghost"
        :size="compact ? 'sm' : 'default'"
        @click.stop="handleDownload"
      >
        <Download :class="compact ? 'w-3 h-3' : 'w-4 h-4'" />
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  FileText, 
  Image, 
  Video, 
  Music, 
  Archive, 
  File as FileIcon,
  Download
} from 'lucide-vue-next'
import type { MessageFile } from '../../types/messaging'

interface Props {
  file: MessageFile
  compact?: boolean
}

const props = defineProps<Props>()

const { file, compact } = props

// File type helpers
const getFileIcon = (fileType: string | null) => {
  if (!fileType) return FileIcon
  
  const type = fileType.toLowerCase()
  
  if (type.includes('image')) return Image
  if (type.includes('video')) return Video
  if (type.includes('audio')) return Music
  if (type.includes('pdf') || type.includes('document') || type.includes('text')) return FileText
  if (type.includes('zip') || type.includes('archive')) return Archive
  
  return FileIcon
}

const getFileTypeColor = (fileType: string | null) => {
  if (!fileType) return 'bg-muted text-muted-foreground'
  
  const type = fileType.toLowerCase()
  
  if (type.includes('image')) return 'bg-green-100 text-green-600'
  if (type.includes('video')) return 'bg-purple-100 text-purple-600'
  if (type.includes('audio')) return 'bg-blue-100 text-blue-600'
  if (type.includes('pdf')) return 'bg-red-100 text-red-600'
  if (type.includes('document')) return 'bg-blue-100 text-blue-600'
  if (type.includes('zip') || type.includes('archive')) return 'bg-orange-100 text-orange-600'
  
  return 'bg-muted text-muted-foreground'
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

// Download handler
const handleDownload = async () => {
  try {
    // TODO: Implement actual file download from API
    // const response = await $fetch(`/api/messaging/files/${file.id}/download`)
    
    // Create download link
    const link = document.createElement('a')
    link.href = file.fileUrl
    link.download = file.fileName
    link.target = '_blank'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    console.error('Failed to download file:', error)
    // TODO: Show error toast
  }
}
</script>
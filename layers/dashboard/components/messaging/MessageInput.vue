<template>
  <div class="p-4 border-t bg-background">
    <!-- File upload preview -->
    <div v-if="uploadedFiles.length > 0" class="mb-3">
      <div class="flex flex-wrap gap-2">
        <div
          v-for="(file, index) in uploadedFiles"
          :key="index"
          class="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg"
        >
          <Paperclip class="w-4 h-4" />
          <span class="text-sm truncate max-w-32">{{ file.name }}</span>
          <Button
            variant="ghost"
            size="sm"
            class="h-4 w-4 p-0"
            @click="removeFile(index)"
          >
            <X class="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>

    <!-- Input area -->
    <div class="flex items-end gap-2">
      <!-- File upload button -->
      <div class="flex-shrink-0">
        <input
          ref="fileInput"
          type="file"
          multiple
          class="hidden"
          @change="handleFileSelect"
        />
        <Button
          variant="ghost"
          size="sm"
          :disabled="disabled"
          @click="fileInput?.click()"
        >
          <Paperclip class="w-4 h-4" />
        </Button>
      </div>

      <!-- Text input -->
      <div class="flex-1 relative">
        <Textarea
          ref="textareaRef"
          v-model="message"
          placeholder="Type a message..."
          class="resize-none pr-12 min-h-[40px] max-h-32"
          :disabled="disabled"
          @keydown="handleKeyDown"
          @input="handleInput"
          @focus="handleFocus"
          @blur="handleBlur"
        />
        
        <!-- Character count -->
        <div
          v-if="message.length > 500"
          class="absolute bottom-1 right-12 text-xs text-muted-foreground"
        >
          {{ message.length }}/1000
        </div>
      </div>

      <!-- Send button -->
      <div class="flex-shrink-0">
        <Button
          :disabled="!canSend || sending"
          @click="handleSend"
        >
          <Send v-if="!sending" class="w-4 h-4" />
          <div v-else class="w-4 h-4 animate-spin border-2 border-current border-t-transparent rounded-full" />
        </Button>
      </div>
    </div>

    <!-- Typing indicator -->
    <div v-if="isTyping" class="mt-2 text-xs text-muted-foreground">
      <div class="flex items-center gap-2">
        <div class="flex space-x-1">
          <div class="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style="animation-delay: 0s" />
          <div class="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style="animation-delay: 0.1s" />
          <div class="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style="animation-delay: 0.2s" />
        </div>
        <span>Typing...</span>
      </div>
    </div>

    <!-- Upload progress -->
    <div v-if="uploadProgress > 0 && uploadProgress < 100" class="mt-2">
      <div class="flex items-center gap-2 text-sm">
        <span>Uploading files...</span>
        <div class="flex-1 bg-muted rounded-full h-2">
          <div
            class="bg-primary h-2 rounded-full transition-all duration-300"
            :style="{ width: `${uploadProgress}%` }"
          />
        </div>
        <span>{{ uploadProgress }}%</span>
      </div>
    </div>

    <!-- Error message -->
    <div v-if="error" class="mt-2 text-sm text-destructive">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { Send, Paperclip, X } from 'lucide-vue-next'

interface Props {
  conversationId: string
  disabled?: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  send: [content: string, files?: File[]]
  typing: []
  stopTyping: []
}>()

// Reactive state
const message = ref('')
const uploadedFiles = ref<File[]>([])
const uploadProgress = ref(0)
const error = ref('')
const sending = ref(false)
const isTyping = ref(false)

// Refs
const textareaRef = ref<HTMLTextAreaElement>()
const fileInput = ref<HTMLInputElement>()

// Computed
const canSend = computed(() => {
  return (message.value.trim().length > 0 || uploadedFiles.value.length > 0) &&
         !sending.value &&
         message.value.length <= 1000
})

// Typing management
let typingTimer: NodeJS.Timeout | null = null

const startTyping = () => {
  if (!isTyping.value) {
    isTyping.value = true
    emit('typing')
  }
  
  // Clear existing timer
  if (typingTimer) {
    clearTimeout(typingTimer)
  }
  
  // Stop typing after 3 seconds of inactivity
  typingTimer = setTimeout(stopTyping, 3000)
}

const stopTyping = () => {
  if (isTyping.value) {
    isTyping.value = false
    emit('stopTyping')
  }
  
  if (typingTimer) {
    clearTimeout(typingTimer)
    typingTimer = null
  }
}

// Event handlers
const handleInput = () => {
  // Auto-resize textarea
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
    textareaRef.value.style.height = `${textareaRef.value.scrollHeight}px`
  }
  
  // Handle typing indicators
  if (message.value.trim().length > 0) {
    startTyping()
  } else {
    stopTyping()
  }
}

const handleKeyDown = (event: KeyboardEvent) => {
  // Send on Enter (but not Shift+Enter)
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSend()
  }
  
  // Clear error on typing
  if (error.value) {
    error.value = ''
  }
}

const handleFocus = () => {
  // Clear error when focusing
  error.value = ''
}

const handleBlur = () => {
  // Stop typing when losing focus
  stopTyping()
}

const handleSend = async () => {
  if (!canSend.value) return

  const content = message.value.trim()
  const files = [...uploadedFiles.value]

  if (!content && files.length === 0) return

  try {
    sending.value = true
    error.value = ''
    
    // TODO: Handle file uploads first if any
    if (files.length > 0) {
      await uploadFiles(files)
    }
    
    // Send message
    emit('send', content, files.length > 0 ? files : undefined)
    
    // Clear input
    message.value = ''
    uploadedFiles.value = []
    uploadProgress.value = 0
    
    // Reset textarea height
    if (textareaRef.value) {
      textareaRef.value.style.height = 'auto'
    }
    
    // Stop typing indicator
    stopTyping()
    
  } catch (err: any) {
    error.value = err.message || 'Failed to send message'
  } finally {
    sending.value = false
  }
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = Array.from(target.files || [])
  
  // Validate files
  const maxSize = 10 * 1024 * 1024 // 10MB
  const validFiles = files.filter(file => {
    if (file.size > maxSize) {
      error.value = `File "${file.name}" is too large. Maximum size is 10MB.`
      return false
    }
    return true
  })
  
  // Add to uploaded files (max 5 files)
  const totalFiles = uploadedFiles.value.length + validFiles.length
  if (totalFiles > 5) {
    error.value = 'Maximum 5 files allowed per message'
    return
  }
  
  uploadedFiles.value.push(...validFiles)
  
  // Clear input
  target.value = ''
}

const removeFile = (index: number) => {
  uploadedFiles.value.splice(index, 1)
  error.value = ''
}

const uploadFiles = async (files: File[]) => {
  // TODO: Implement actual file upload
  uploadProgress.value = 0
  
  // Simulate upload progress
  for (let i = 0; i <= 100; i += 10) {
    uploadProgress.value = i
    await new Promise(resolve => setTimeout(resolve, 100))
  }
}

// Cleanup on unmount
onUnmounted(() => {
  stopTyping()
})

// Focus textarea when component mounts
onMounted(async () => {
  await nextTick()
  textareaRef.value?.focus()
})
</script>
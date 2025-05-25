<template>
  <div
    :class="[
      'flex gap-3 group',
      isOwn ? 'flex-row-reverse' : 'flex-row'
    ]"
  >
    <!-- Avatar (only for other users) -->
    <Avatar v-if="!isOwn" class="w-8 h-8 flex-shrink-0">
      <AvatarFallback>
        {{ getUserInitials(message.sender?.name || 'User') }}
      </AvatarFallback>
    </Avatar>

    <!-- Message Content -->
    <div
      :class="[
        'max-w-xs lg:max-w-md xl:max-w-lg',
        isOwn ? 'items-end' : 'items-start'
      ]"
      class="flex flex-col"
    >
      <!-- Sender name and timestamp -->
      <div
        v-if="!isOwn && message.sender"
        class="flex items-center gap-2 mb-1 text-xs text-muted-foreground"
      >
        <span class="font-medium">{{ message.sender.name }}</span>
        <span>•</span>
        <span>{{ formatTime(message.createdAt) }}</span>
      </div>

      <!-- Message bubble -->
      <div
        :class="[
          'relative px-3 py-2 rounded-lg shadow-sm',
          isOwn
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted',
          message.deletedAt && 'opacity-60'
        ]"
      >
        <!-- Deleted message -->
        <div v-if="message.deletedAt" class="italic text-sm">
          <Trash2 class="w-4 h-4 inline mr-1" />
          This message was deleted
        </div>

        <!-- Regular message content -->
        <div v-else class="space-y-2">
          <!-- Text content -->
          <div v-if="message.content" class="text-sm whitespace-pre-wrap break-words">
            {{ message.content }}
          </div>

          <!-- File attachments -->
          <div v-if="message.files && message.files.length > 0" class="space-y-2">
            <MessageFile
              v-for="file in message.files"
              :key="file.id"
              :file="file"
              :compact="true"
            />
          </div>

          <!-- Edited indicator -->
          <div v-if="message.editedAt" class="text-xs opacity-70">
            (edited)
          </div>
        </div>

        <!-- Message status indicators -->
        <div
          v-if="isOwn"
          class="absolute -bottom-1 -right-1 flex items-center"
        >
          <!-- Sending status -->
          <div
            v-if="message.id.startsWith('temp-')"
            class="w-4 h-4 rounded-full bg-background flex items-center justify-center"
          >
            <div class="w-2 h-2 rounded-full bg-muted-foreground animate-pulse" />
          </div>
          
          <!-- Read receipts -->
          <div
            v-else-if="message.readBy && message.readBy.length > 0"
            class="w-4 h-4 rounded-full bg-background flex items-center justify-center"
          >
            <CheckCheck class="w-3 h-3 text-blue-500" />
          </div>
          
          <!-- Delivered -->
          <div
            v-else
            class="w-4 h-4 rounded-full bg-background flex items-center justify-center"
          >
            <Check class="w-3 h-3 text-muted-foreground" />
          </div>
        </div>
      </div>

      <!-- Timestamp for own messages -->
      <div
        v-if="isOwn"
        class="text-xs text-muted-foreground mt-1 text-right"
      >
        {{ formatTime(message.createdAt) }}
      </div>

      <!-- Message actions (visible on hover) -->
      <div
        :class="[
          'flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity',
          isOwn ? 'justify-end' : 'justify-start'
        ]"
      >
        <!-- React -->
        <Button variant="ghost" size="sm" class="h-6 px-2">
          <Smile class="w-3 h-3" />
        </Button>

        <!-- Reply -->
        <Button variant="ghost" size="sm" class="h-6 px-2">
          <Reply class="w-3 h-3" />
        </Button>

        <!-- More options -->
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" class="h-6 px-2">
              <MoreHorizontal class="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent :align="isOwn ? 'end' : 'start'">
            <DropdownMenuItem @click="copyMessage">
              <Copy class="w-4 h-4 mr-2" />
              Copy text
            </DropdownMenuItem>
            
            <DropdownMenuItem v-if="isOwn && !message.deletedAt" @click="editMessage">
              <Edit class="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            
            <DropdownMenuSeparator v-if="isOwn && !message.deletedAt" />
            
            <DropdownMenuItem
              v-if="isOwn && !message.deletedAt"
              class="text-destructive"
              @click="deleteMessage"
            >
              <Trash2 class="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>

            <DropdownMenuItem v-if="!isOwn" @click="reportMessage">
              <Flag class="w-4 h-4 mr-2" />
              Report
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <!-- Retry button for failed messages -->
        <Button
          v-if="message.id.startsWith('failed-')"
          variant="ghost"
          size="sm"
          class="h-6 px-2 text-destructive"
          @click="$emit('retry', message)"
        >
          <RotateCcw class="w-3 h-3" />
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  Check, 
  CheckCheck, 
  Trash2, 
  Smile, 
  Reply, 
  MoreHorizontal,
  Copy,
  Edit,
  Flag,
  RotateCcw
} from 'lucide-vue-next'
import type { Message } from '../../types/messaging'
import MessageFile from './MessageFile.vue'

interface Props {
  message: Message
  isOwn: boolean
}

const props = defineProps<Props>()

defineEmits<{
  retry: [message: Message]
}>()

const { message, isOwn } = props

// Helper functions
const getUserInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const formatTime = (date: Date | string) => {
  const messageDate = new Date(date)
  return messageDate.toLocaleTimeString('en-UK', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

// Message actions
const copyMessage = async () => {
  if (message.content) {
    try {
      await navigator.clipboard.writeText(message.content)
      // TODO: Show toast notification
    } catch (error) {
      console.error('Failed to copy message:', error)
    }
  }
}

const editMessage = () => {
  // TODO: Implement edit functionality
  console.log('Edit message:', message.id)
}

const deleteMessage = () => {
  // TODO: Implement delete functionality
  console.log('Delete message:', message.id)
}

const reportMessage = () => {
  // TODO: Implement report functionality
  console.log('Report message:', message.id)
}
</script>
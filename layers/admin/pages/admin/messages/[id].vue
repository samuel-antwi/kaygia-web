<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  ArrowLeft, 
  MoreVertical, 
  Archive, 
  UserPlus, 
  Ban, 
  Trash2, 
  Flag,
  Send,
  Paperclip,
  Clock
} from 'lucide-vue-next'
import type { Message } from '~/layers/dashboard/types/messaging'
import type { AdminConversation } from '~/layers/admin/types/messaging'
import { formatDateTime, formatRelativeTime } from '~/layers/admin/utils/dateFormatting'
import { isSuperAdmin } from '~/layers/admin/utils/adminAccess'
import AssignTeamDialog from '~/layers/admin/components/messaging/AssignTeamDialog.vue'

definePageMeta({
  layout: 'admin'
})

const route = useRoute()
const router = useRouter()
const conversationId = computed(() => route.params.id as string)

// Get current user
const { user } = useAuth()

// Check if user can assign team members
const canAssignTeamMembers = computed(() => isSuperAdmin(user.value?.role))

// State
const conversation = ref<AdminConversation | null>(null)
const messages = ref<Message[]>([])
const loading = ref(true)
const sending = ref(false)
const messageContent = ref('')
const selectedMessages = ref<string[]>([])

// Refs for dialogs
const assignTeamDialog = ref<InstanceType<typeof AssignTeamDialog>>()

// Fetch conversation details
const { data: convData, refresh: refreshConversation } = await useFetch<{ conversation: AdminConversation }>(`/api/admin/messaging/conversations/${conversationId.value}`)

watchEffect(() => {
  if (convData.value?.conversation) {
    conversation.value = convData.value.conversation
  }
})

// Fetch messages
const { data: msgData, refresh: refreshMessages } = await useFetch<{ messages: Message[] }>(
  `/api/admin/messaging/conversations/${conversationId.value}/messages`
)

watchEffect(() => {
  if (msgData.value?.messages) {
    messages.value = msgData.value.messages as Message[]
  }
  loading.value = false
})

// Computed
const participants = computed(() => {
  return conversation.value?.participants || []
})

const client = computed(() => {
  return participants.value.find((p: any) => p.role === 'owner')?.user
})

const teamMembers = computed(() => {
  return participants.value.filter((p: any) => p.role !== 'owner').map((p: any) => p.user)
})

// Actions
const sendMessage = async () => {
  if (!messageContent.value.trim() || sending.value) return
  
  sending.value = true
  try {
    await $fetch(`/api/admin/messaging/conversations/${conversationId.value}/messages`, {
      method: 'POST',
      body: {
        content: messageContent.value.trim()
      }
    })
    
    messageContent.value = ''
    await refreshMessages()
  } catch (error) {
    console.error('Failed to send message:', error)
  } finally {
    sending.value = false
  }
}

const archiveConversation = async () => {
  try {
    await $fetch(`/api/admin/messaging/conversations/${conversationId.value}/status`, {
      method: 'PATCH',
      body: { status: 'archived' }
    })
    router.push('/admin/messages')
  } catch (error) {
    console.error('Failed to archive conversation:', error)
  }
}

const deleteSelectedMessages = async () => {
  // TODO: Implement message deletion
  console.log('Delete messages:', selectedMessages.value)
}

const flagSelectedMessages = async () => {
  // TODO: Implement message flagging
  console.log('Flag messages:', selectedMessages.value)
}

const assignTeamMember = async () => {
  if (!canAssignTeamMembers.value) {
    console.warn('Only super admins can assign team members')
    return
  }
  
  await nextTick()
  assignTeamDialog.value?.open()
}

// Handle assignment completion
const onTeamAssigned = async (memberId: string) => {
  // Refresh conversation to show updated assignment
  await refreshConversation()
}

// Use the imported formatDateTime function instead
const formatTime = formatDateTime

const getUserInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
</script>

<template>
  <div class="h-[calc(100vh-8rem)] flex flex-col">
    <!-- Header -->
    <div class="mb-4 flex items-center justify-between">
      <div class="flex items-center gap-4">
        <Button variant="ghost" size="sm" @click="router.push('/admin/messages')">
          <ArrowLeft class="h-4 w-4 mr-2" />
          Back to Conversations
        </Button>
        
        <div v-if="conversation">
          <h1 class="text-xl font-bold">{{ conversation.title || 'Conversation' }}</h1>
          <p class="text-sm text-muted-foreground">
            Project: {{ conversation.project?.name || 'No project' }}
          </p>
        </div>
      </div>
      
      <div class="flex items-center gap-2">
        <Badge :variant="conversation?.status === 'active' ? 'default' : 'secondary'">
          {{ conversation?.status }}
        </Badge>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <MoreVertical class="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem 
              v-if="canAssignTeamMembers"
              @click="assignTeamMember"
            >
              <UserPlus class="h-4 w-4 mr-2" />
              Assign Team Member
            </DropdownMenuItem>
            <DropdownMenuSeparator v-if="canAssignTeamMembers" />
            <DropdownMenuItem @click="archiveConversation" class="text-destructive">
              <Archive class="h-4 w-4 mr-2" />
              Archive Conversation
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 overflow-hidden">
      <!-- Messages Section -->
      <Card class="lg:col-span-3 flex flex-col">
        <CardHeader class="border-b">
          <div class="flex items-center justify-between">
            <CardTitle class="text-lg">Messages</CardTitle>
            
            <!-- Message Actions -->
            <div v-if="selectedMessages.length > 0" class="flex items-center gap-2">
              <span class="text-sm text-muted-foreground">
                {{ selectedMessages.length }} selected
              </span>
              <Button variant="outline" size="sm" @click="deleteSelectedMessages">
                <Trash2 class="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" @click="flagSelectedMessages">
                <Flag class="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent class="flex-1 overflow-y-auto p-4">
          <!-- Messages -->
          <div class="space-y-4">
            <div
              v-for="message in messages"
              :key="message.id"
              class="flex items-start gap-3"
            >
              <Checkbox
                :checked="selectedMessages.includes(message.id)"
                @update:checked="(checked: boolean) => {
                  if (checked) {
                    selectedMessages.push(message.id)
                  } else {
                    selectedMessages = selectedMessages.filter(id => id !== message.id)
                  }
                }"
              />
              
              <Avatar class="h-8 w-8">
                <AvatarFallback>
                  {{ getUserInitials(message.sender?.name || 'User') }}
                </AvatarFallback>
              </Avatar>
              
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <span class="font-medium">{{ message.sender?.name || 'Unknown' }}</span>
                  <Badge v-if="message.sender?.role === 'ADMIN'" variant="secondary" class="text-xs">
                    Admin
                  </Badge>
                  <span class="text-xs text-muted-foreground">{{ formatTime(message.createdAt) }}</span>
                </div>
                
                <div class="bg-muted p-3 rounded-lg">
                  <p>{{ message.content }}</p>
                  
                  <!-- File attachments -->
                  <div v-if="message.files?.length" class="mt-2 space-y-1">
                    <div
                      v-for="file in message.files"
                      :key="file.id"
                      class="flex items-center gap-2 text-sm"
                    >
                      <Paperclip class="h-4 w-4" />
                      <a :href="file.fileUrl" target="_blank" class="underline">
                        {{ file.fileName }}
                      </a>
                    </div>
                  </div>
                </div>
                
                <!-- Message metadata -->
                <div class="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                  <span v-if="message.editedAt">Edited</span>
                  <span v-if="message.deletedAt" class="text-destructive">Deleted</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Loading -->
          <div v-if="loading" class="text-center py-8">
            <div class="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
          </div>
        </CardContent>
        
        <!-- Message Input -->
        <CardContent class="border-t p-4">
          <form @submit.prevent="sendMessage" class="flex gap-2">
            <Input
              v-model="messageContent"
              placeholder="Type a message..."
              :disabled="sending || conversation?.status !== 'active'"
              class="flex-1"
            />
            <Button
              type="submit"
              :disabled="!messageContent.trim() || sending || conversation?.status !== 'active'"
            >
              <Send class="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>

      <!-- Sidebar -->
      <div class="space-y-4">
        <!-- Participants -->
        <Card>
          <CardHeader>
            <CardTitle class="text-sm">Participants</CardTitle>
          </CardHeader>
          <CardContent class="space-y-3">
            <!-- Client -->
            <div v-if="client">
              <p class="text-xs font-medium text-muted-foreground mb-1">Client</p>
              <div class="flex items-center gap-2">
                <Avatar class="h-8 w-8">
                  <AvatarFallback>{{ getUserInitials(client.name || 'Client') }}</AvatarFallback>
                </Avatar>
                <div>
                  <p class="text-sm font-medium">{{ client.name }}</p>
                  <p class="text-xs text-muted-foreground">{{ client.email }}</p>
                </div>
              </div>
            </div>
            
            <!-- Team Members -->
            <div v-if="teamMembers.length > 0">
              <p class="text-xs font-medium text-muted-foreground mb-1">Team</p>
              <div class="space-y-2">
                <div
                  v-for="member in teamMembers"
                  :key="member.id"
                  class="flex items-center gap-2"
                >
                  <Avatar class="h-8 w-8">
                    <AvatarFallback>{{ getUserInitials(member.name || 'Team') }}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p class="text-sm font-medium">{{ member.name }}</p>
                    <p class="text-xs text-muted-foreground">{{ member.role }}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <Button 
              v-if="canAssignTeamMembers"
              variant="outline" 
              size="sm" 
              class="w-full" 
              @click="assignTeamMember"
            >
              <UserPlus class="h-4 w-4 mr-2" />
              Add Team Member
            </Button>
          </CardContent>
        </Card>
        
        <!-- Conversation Info -->
        <Card>
          <CardHeader>
            <CardTitle class="text-sm">Information</CardTitle>
          </CardHeader>
          <CardContent class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-muted-foreground">Created</span>
              <span>{{ conversation?.createdAt ? formatTime(conversation.createdAt) : 'Unknown' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">Messages</span>
              <span>{{ messages.length }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">Type</span>
              <Badge variant="outline">{{ conversation?.type || 'project' }}</Badge>
            </div>
          </CardContent>
        </Card>
        
        <!-- Quick Actions -->
        <Card>
          <CardHeader>
            <CardTitle class="text-sm">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent class="space-y-2">
            <Button variant="outline" size="sm" class="w-full justify-start">
              <Ban class="h-4 w-4 mr-2" />
              Block User
            </Button>
            <Button variant="outline" size="sm" class="w-full justify-start">
              <Flag class="h-4 w-4 mr-2" />
              Flag Conversation
            </Button>
            <Button
              variant="destructive"
              size="sm"
              class="w-full justify-start"
              @click="archiveConversation"
            >
              <Archive class="h-4 w-4 mr-2" />
              Archive
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
    
    <!-- Assign Team Dialog -->
    <AssignTeamDialog
      ref="assignTeamDialog"
      :conversation-id="conversationId"
      :current-assignee="conversation?.assignedTo"
      @assigned="onTeamAssigned"
    />
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import { MessageSquare, Search, Users, Clock, MoreVertical, Archive, UserPlus } from 'lucide-vue-next'
import type { AdminConversation } from '~/layers/admin/types/messaging'
import { formatRelativeTime } from '~/layers/admin/utils/dateFormatting'

definePageMeta({
  layout: 'admin'
})

// State
const conversations = ref<AdminConversation[]>([])
const loading = ref(true)
const searchQuery = ref('')
const statusFilter = ref<'all' | 'active' | 'archived'>('all')
const selectedConversations = ref<string[]>([])

// Fetch conversations
const { data, pending } = await useFetch('/api/admin/messaging/conversations', {
  query: {
    status: computed(() => statusFilter.value === 'all' ? undefined : statusFilter.value),
    search: searchQuery
  }
})

// Update conversations when data changes
watchEffect(() => {
  if (data.value?.conversations) {
    conversations.value = data.value.conversations
  }
  loading.value = pending.value
})

// Computed
const filteredConversations = computed(() => {
  return conversations.value
})

const stats = computed(() => ({
  total: conversations.value.length,
  active: conversations.value.filter(c => c.status === 'active').length,
  archived: conversations.value.filter(c => c.status === 'archived').length,
  unassigned: conversations.value.filter(c => !c.assignedTo).length
}))

// Actions
const handleBulkArchive = async () => {
  // TODO: Implement bulk archive
  console.log('Archive:', selectedConversations.value)
}

const handleBulkAssign = async () => {
  // TODO: Implement bulk assign
  console.log('Assign:', selectedConversations.value)
}

const toggleSelectAll = () => {
  if (selectedConversations.value.length === filteredConversations.value.length) {
    selectedConversations.value = []
  } else {
    selectedConversations.value = filteredConversations.value.map(c => c.id)
  }
}

// Use the imported formatRelativeTime function
const formatTime = formatRelativeTime
</script>

<template>
  <div>
    <!-- Page Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold mb-2">Message Management</h1>
      <p class="text-muted-foreground">
        Monitor and manage all client conversations across projects
      </p>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Total Conversations</CardTitle>
          <MessageSquare class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ stats.total }}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Active</CardTitle>
          <MessageSquare class="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ stats.active }}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Archived</CardTitle>
          <Archive class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ stats.archived }}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Unassigned</CardTitle>
          <Users class="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ stats.unassigned }}</div>
        </CardContent>
      </Card>
    </div>

    <!-- Filters and Actions -->
    <Card class="mb-6">
      <CardContent class="p-4">
        <div class="flex flex-col md:flex-row gap-4">
          <!-- Search -->
          <div class="flex-1">
            <div class="relative">
              <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                v-model="searchQuery"
                placeholder="Search conversations..."
                class="pl-10"
              />
            </div>
          </div>
          
          <!-- Status Filter -->
          <Select v-model="statusFilter">
            <SelectTrigger class="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          
          <!-- Bulk Actions -->
          <div class="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              :disabled="selectedConversations.length === 0"
              @click="handleBulkArchive"
            >
              <Archive class="h-4 w-4 mr-2" />
              Archive Selected
            </Button>
            <Button
              variant="outline"
              size="sm"
              :disabled="selectedConversations.length === 0"
              @click="handleBulkAssign"
            >
              <UserPlus class="h-4 w-4 mr-2" />
              Assign Selected
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Conversations Table -->
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="w-[40px]">
              <Checkbox
                :checked="selectedConversations.length === filteredConversations.length && filteredConversations.length > 0"
                @update:checked="toggleSelectAll"
              />
            </TableHead>
            <TableHead>Conversation</TableHead>
            <TableHead>Project</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>Messages</TableHead>
            <TableHead>Last Activity</TableHead>
            <TableHead>Status</TableHead>
            <TableHead class="w-[60px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow
            v-for="conversation in filteredConversations"
            :key="conversation.id"
            class="cursor-pointer hover:bg-muted/50"
            @click="$router.push(`/admin/messages/${conversation.id}`)"
          >
            <TableCell @click.stop>
              <Checkbox
                :checked="selectedConversations.includes(conversation.id)"
                @update:checked="(checked: boolean) => {
                  if (checked) {
                    selectedConversations.push(conversation.id)
                  } else {
                    selectedConversations = selectedConversations.filter(id => id !== conversation.id)
                  }
                }"
              />
            </TableCell>
            <TableCell class="font-medium">
              <div>
                <p class="font-medium">{{ conversation.title || 'Untitled Conversation' }}</p>
                <p class="text-sm text-muted-foreground" v-if="conversation.lastMessage">
                  {{ (conversation.lastMessage.content || '').substring(0, 50) }}...
                </p>
              </div>
            </TableCell>
            <TableCell>
              <div v-if="conversation.project">
                <p class="font-medium">{{ conversation.project.name }}</p>
                <p class="text-xs text-muted-foreground">{{ conversation.project.id.substring(0, 8) }}...</p>
              </div>
              <span v-else class="text-muted-foreground">-</span>
            </TableCell>
            <TableCell>
              <div v-if="conversation.participants?.[0]">
                <p>{{ conversation.participants[0].user?.name || 'Unknown' }}</p>
                <p class="text-xs text-muted-foreground">{{ conversation.participants[0].user?.email }}</p>
              </div>
            </TableCell>
            <TableCell>
              <div v-if="conversation.assignedTo">
                <Badge variant="outline">{{ conversation.assignedTo.name }}</Badge>
              </div>
              <Badge v-else variant="destructive">Unassigned</Badge>
            </TableCell>
            <TableCell>
              <div class="flex items-center gap-2">
                <span>{{ conversation.messageCount || 0 }}</span>
                <Badge v-if="conversation.unreadCount" variant="default" class="text-xs">
                  {{ conversation.unreadCount }} new
                </Badge>
              </div>
            </TableCell>
            <TableCell>
              <div class="flex items-center gap-2">
                <Clock class="h-4 w-4 text-muted-foreground" />
                <span class="text-sm">{{ formatTime(conversation.lastMessage?.createdAt || conversation.updatedAt) }}</span>
              </div>
            </TableCell>
            <TableCell>
              <Badge
                :variant="conversation.status === 'active' ? 'default' : 'secondary'"
              >
                {{ conversation.status }}
              </Badge>
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild @click.stop>
                  <Button variant="ghost" size="sm">
                    <MoreVertical class="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem @click.stop="$router.push(`/admin/messages/${conversation.id}`)">
                    View Conversation
                  </DropdownMenuItem>
                  <DropdownMenuItem @click.stop>
                    Assign Team Member
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem @click.stop class="text-destructive">
                    Archive Conversation
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      
      <!-- Empty State -->
      <div v-if="!loading && filteredConversations.length === 0" class="p-8 text-center">
        <MessageSquare class="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p class="text-muted-foreground">No conversations found</p>
      </div>
      
      <!-- Loading State -->
      <div v-if="loading" class="p-8 text-center">
        <div class="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
      </div>
    </Card>
  </div>
</template>
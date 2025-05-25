<script setup lang="ts">
import { ref } from 'vue'
import { User, Check } from 'lucide-vue-next'

interface TeamMember {
  id: string
  name: string
  email: string
  role: string
  assignedCount?: number
}

interface Props {
  conversationId?: string
  currentAssignee?: TeamMember
}

const props = defineProps<Props>()
const emit = defineEmits<{
  assigned: [memberId: string]
}>()

const isOpen = ref(false)
const selectedMemberId = ref<string | null>(props.currentAssignee?.id || null)
const teamMembers = ref<TeamMember[]>([])
const loading = ref(false)
const assigning = ref(false)
const showUnassignOption = ref(false)

// Fetch team members when dialog opens
const fetchTeamMembers = async () => {
  loading.value = true
  try {
    const { members } = await $fetch('/api/admin/team/members', {
      query: { includeStats: true }
    })
    // Handle potential null names
    teamMembers.value = members.map(m => ({
      ...m,
      name: m.name || 'Unknown User'
    }))
  } catch (error) {
    console.error('Failed to fetch team members:', error)
  } finally {
    loading.value = false
  }
}

// Handle assignment
const handleAssign = async () => {
  if (!props.conversationId) return
  
  assigning.value = true
  try {
    // If no member selected and showUnassignOption is true, unassign
    if (!selectedMemberId.value && showUnassignOption.value) {
      await $fetch(`/api/admin/messaging/conversations/${props.conversationId}/unassign`, {
        method: 'POST'
      })
      emit('assigned', '') // Empty string indicates unassigned
    } else if (selectedMemberId.value) {
      // Assign the selected member
      await $fetch(`/api/admin/messaging/conversations/${props.conversationId}/assign`, {
        method: 'POST',
        body: {
          teamMemberId: selectedMemberId.value
        }
      })
      emit('assigned', selectedMemberId.value)
    }
    
    isOpen.value = false
  } catch (error) {
    console.error('Failed to assign/unassign team member:', error)
  } finally {
    assigning.value = false
  }
}

// Open dialog and fetch members
const open = () => {
  isOpen.value = true
  selectedMemberId.value = props.currentAssignee?.id || null
  showUnassignOption.value = !!props.currentAssignee
  fetchTeamMembers()
}

// Expose open method to parent
defineExpose({
  open
})
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Assign Team Member</DialogTitle>
        <DialogDescription>
          Select a team member to handle this conversation
        </DialogDescription>
      </DialogHeader>
      
      <div v-if="loading" class="py-8 text-center">
        <div class="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
      </div>
      
      <div v-else class="space-y-4">
        <div v-if="props.currentAssignee" class="p-3 bg-muted rounded-lg">
          <p class="text-sm text-muted-foreground mb-1">Currently assigned to:</p>
          <div class="flex items-center gap-2">
            <Avatar class="h-8 w-8">
              <AvatarFallback>{{ props.currentAssignee.name.charAt(0) }}</AvatarFallback>
            </Avatar>
            <div>
              <p class="font-medium">{{ props.currentAssignee.name }}</p>
              <p class="text-xs text-muted-foreground">{{ props.currentAssignee.email }}</p>
            </div>
          </div>
        </div>
        
        <div class="space-y-2">
          <Label>Select Team Member</Label>
          <div class="space-y-2 max-h-[300px] overflow-y-auto">
            <!-- Unassign option -->
            <div
              v-if="showUnassignOption"
              @click="selectedMemberId = null"
              class="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
              :class="{
                'border-primary bg-primary/5': selectedMemberId === null,
                'border-border': selectedMemberId !== null
              }"
            >
              <div class="flex items-center gap-3">
                <div class="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                  <User class="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p class="font-medium">Unassign</p>
                  <p class="text-sm text-muted-foreground">Remove current assignment</p>
                </div>
              </div>
              <Check
                v-if="selectedMemberId === null"
                class="h-5 w-5 text-primary"
              />
            </div>
            
            <!-- Team members -->
            <div
              v-for="member in teamMembers"
              :key="member.id"
              @click="selectedMemberId = member.id"
              class="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
              :class="{
                'border-primary bg-primary/5': selectedMemberId === member.id,
                'border-border': selectedMemberId !== member.id
              }"
            >
              <div class="flex items-center gap-3">
                <Avatar class="h-10 w-10">
                  <AvatarFallback>{{ member.name.charAt(0) }}</AvatarFallback>
                </Avatar>
                <div>
                  <p class="font-medium">{{ member.name }}</p>
                  <p class="text-sm text-muted-foreground">{{ member.email }}</p>
                  <p class="text-xs text-muted-foreground">
                    {{ member.assignedCount || 0 }} active conversations
                  </p>
                </div>
              </div>
              <Check
                v-if="selectedMemberId === member.id"
                class="h-5 w-5 text-primary"
              />
            </div>
          </div>
        </div>
      </div>
      
      <DialogFooter>
        <Button variant="outline" @click="isOpen = false" :disabled="assigning">
          Cancel
        </Button>
        <Button
          @click="handleAssign"
          :disabled="(selectedMemberId === null && !showUnassignOption) || assigning"
        >
          <User class="h-4 w-4 mr-2" />
          {{ selectedMemberId === null && showUnassignOption ? 'Unassign' : 'Assign' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
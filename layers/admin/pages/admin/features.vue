<template>
  <div class="container mx-auto py-6 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold">Feature Development Tracker</h1>
        <p class="text-muted-foreground mt-1">
          Track implementation progress for client dashboard features
        </p>
      </div>
      <div class="flex items-center gap-2">
        <Badge variant="outline">
          <CheckCircle class="h-3 w-3 mr-1" />
          {{ completedFeatures }} / {{ totalFeatures }} Complete
        </Badge>
        <Progress :value="overallProgress" class="w-32" />
      </div>
    </div>

    <!-- Phase Overview Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card v-for="phase in phases" :key="phase.id">
        <CardHeader class="pb-3">
          <div class="flex items-center justify-between">
            <CardTitle class="text-lg">{{ phase.name }}</CardTitle>
            <Badge 
              :variant="getPhaseVariant(phase.status)"
              :class="getPhaseClass(phase.status)"
            >
              {{ phase.status }}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div class="space-y-3">
            <div class="flex items-center justify-between text-sm">
              <span class="text-muted-foreground">Progress</span>
              <span class="font-medium">{{ phase.progress }}%</span>
            </div>
            <Progress :value="phase.progress" />
            <div class="flex items-center justify-between text-sm">
              <span class="text-muted-foreground">Timeline</span>
              <span>{{ phase.timeline }}</span>
            </div>
            <div class="pt-2 space-y-1">
              <div 
                v-for="feature in phase.features" 
                :key="feature"
                class="text-sm flex items-center gap-2"
              >
                <CheckCircle 
                  v-if="isFeatureComplete(feature)" 
                  class="h-3 w-3 text-green-600" 
                />
                <Circle 
                  v-else 
                  class="h-3 w-3 text-muted-foreground" 
                />
                <span :class="{ 'line-through text-muted-foreground': isFeatureComplete(feature) }">
                  {{ feature }}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Detailed Feature List -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle>Feature Implementation Details</CardTitle>
          <div class="flex items-center gap-2">
            <Input 
              v-model="searchQuery"
              placeholder="Search features..."
              class="w-64"
            />
            <Select v-model="filterStatus">
              <SelectTrigger class="w-40">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="not-started">Not Started</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <div 
            v-for="feature in filteredFeatures" 
            :key="feature.id"
            class="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <h3 class="font-semibold">{{ feature.name }}</h3>
                  <Badge 
                    :variant="getStatusVariant(feature.status)"
                    size="sm"
                  >
                    {{ feature.status }}
                  </Badge>
                  <Badge variant="outline" size="sm">
                    {{ feature.priority }}
                  </Badge>
                </div>
                <p class="text-sm text-muted-foreground mb-3">
                  {{ feature.description }}
                </p>
                
                <!-- Progress bar -->
                <div class="flex items-center gap-3 mb-3">
                  <Progress :value="feature.progress" class="flex-1" />
                  <span class="text-sm font-medium">{{ feature.progress }}%</span>
                </div>

                <!-- Subtasks -->
                <div v-if="feature.subtasks.length > 0" class="space-y-1">
                  <div 
                    v-for="subtask in feature.subtasks" 
                    :key="subtask.id"
                    class="flex items-center gap-2 text-sm"
                  >
                    <Checkbox 
                      :checked="subtask.completed"
                      @update:checked="toggleSubtask(feature.id, subtask.id)"
                    />
                    <span :class="{ 'line-through text-muted-foreground': subtask.completed }">
                      {{ subtask.name }}
                    </span>
                  </div>
                </div>

                <!-- Meta info -->
                <div class="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                  <span>Est: {{ feature.estimatedTime }}</span>
                  <span>•</span>
                  <span>Assigned: {{ feature.assignee || 'Unassigned' }}</span>
                  <span>•</span>
                  <span>Updated: {{ formatDate(feature.updatedAt) }}</span>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex items-center gap-2 ml-4">
                <Button 
                  size="sm" 
                  variant="ghost"
                  @click="updateFeatureStatus(feature.id)"
                >
                  <Play v-if="feature.status === 'not-started'" class="h-4 w-4" />
                  <Pause v-else-if="feature.status === 'in-progress'" class="h-4 w-4" />
                  <CheckCircle v-else class="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost">
                  <Edit class="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">Total Features</p>
              <p class="text-2xl font-bold">{{ totalFeatures }}</p>
            </div>
            <Briefcase class="h-8 w-8 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">In Progress</p>
              <p class="text-2xl font-bold text-blue-600">{{ inProgressCount }}</p>
            </div>
            <Clock class="h-8 w-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">Completed</p>
              <p class="text-2xl font-bold text-green-600">{{ completedFeatures }}</p>
            </div>
            <CheckCircle class="h-8 w-8 text-green-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">Blocked</p>
              <p class="text-2xl font-bold text-red-600">{{ blockedCount }}</p>
            </div>
            <AlertCircle class="h-8 w-8 text-red-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  Briefcase, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Circle,
  Play,
  Pause,
  Edit
} from 'lucide-vue-next'

definePageMeta({
  layout: 'admin'
})

// Filter state
const searchQuery = ref('')
const filterStatus = ref('all')

// Mock data - in real app, this would come from database
const features = ref([
  {
    id: 'msg-001',
    name: 'Real-Time Messaging System',
    description: 'Project-based chat with file sharing and notifications',
    phase: 'phase-1',
    status: 'not-started',
    priority: 'HIGH',
    progress: 0,
    estimatedTime: '2 weeks',
    assignee: null,
    updatedAt: new Date(),
    subtasks: [
      { id: 'msg-sub-001', name: 'Design database schema', completed: false },
      { id: 'msg-sub-002', name: 'Set up WebSocket server', completed: false },
      { id: 'msg-sub-003', name: 'Build chat UI components', completed: false },
      { id: 'msg-sub-004', name: 'Implement file sharing', completed: false },
      { id: 'msg-sub-005', name: 'Add notifications', completed: false },
    ]
  },
  {
    id: 'inv-001',
    name: 'Invoice & Payment Management',
    description: 'Complete billing system with Stripe integration',
    phase: 'phase-1',
    status: 'not-started',
    priority: 'HIGH',
    progress: 0,
    estimatedTime: '2 weeks',
    assignee: null,
    updatedAt: new Date(),
    subtasks: [
      { id: 'inv-sub-001', name: 'Invoice database schema', completed: false },
      { id: 'inv-sub-002', name: 'Stripe API integration', completed: false },
      { id: 'inv-sub-003', name: 'PDF generation', completed: false },
      { id: 'inv-sub-004', name: 'Payment UI', completed: false },
    ]
  },
  {
    id: 'notif-001',
    name: 'Notification System',
    description: 'In-app, email, and push notifications',
    phase: 'phase-1',
    status: 'not-started',
    priority: 'HIGH',
    progress: 0,
    estimatedTime: '1 week',
    assignee: null,
    updatedAt: new Date(),
    subtasks: [
      { id: 'notif-sub-001', name: 'Notification center UI', completed: false },
      { id: 'notif-sub-002', name: 'Email notifications', completed: false },
      { id: 'notif-sub-003', name: 'Push notifications', completed: false },
    ]
  }
])

const phases = ref([
  {
    id: 'phase-1',
    name: 'Phase 1: Immediate',
    status: 'Not Started',
    progress: 0,
    timeline: 'Q1 2025',
    features: ['Messaging', 'Invoices', 'Notifications']
  },
  {
    id: 'phase-2',
    name: 'Phase 2: Next Sprint',
    status: 'Planned',
    progress: 0,
    timeline: 'Q2 2025',
    features: ['Timeline', 'Documents', 'Mobile PWA']
  },
  {
    id: 'phase-3',
    name: 'Phase 3: Future',
    status: 'Future',
    progress: 0,
    timeline: 'Q3 2025',
    features: ['Analytics', 'Approvals']
  }
])

// Computed properties
const totalFeatures = computed(() => features.value.length)
const completedFeatures = computed(() => 
  features.value.filter(f => f.status === 'completed').length
)
const inProgressCount = computed(() => 
  features.value.filter(f => f.status === 'in-progress').length
)
const blockedCount = computed(() => 
  features.value.filter(f => f.status === 'blocked').length
)
const overallProgress = computed(() => {
  if (totalFeatures.value === 0) return 0
  const totalProgress = features.value.reduce((sum, f) => sum + f.progress, 0)
  return Math.round(totalProgress / totalFeatures.value)
})

const filteredFeatures = computed(() => {
  return features.value.filter(feature => {
    const matchesSearch = feature.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         feature.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesStatus = filterStatus.value === 'all' || feature.status === filterStatus.value
    return matchesSearch && matchesStatus
  })
})

// Methods
const isFeatureComplete = (featureName: string) => {
  const feature = features.value.find(f => 
    f.name.toLowerCase().includes(featureName.toLowerCase())
  )
  return feature?.status === 'completed'
}

const getPhaseVariant = (status: string) => {
  switch (status) {
    case 'In Progress': return 'default'
    case 'Completed': return 'secondary'
    default: return 'outline'
  }
}

const getPhaseClass = (status: string) => {
  switch (status) {
    case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'Completed': return 'bg-green-100 text-green-800 border-green-200'
    default: return ''
  }
}

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'completed': return 'secondary'
    case 'in-progress': return 'default'
    case 'blocked': return 'destructive'
    default: return 'outline'
  }
}

const toggleSubtask = (featureId: string, subtaskId: string) => {
  const feature = features.value.find(f => f.id === featureId)
  if (feature) {
    const subtask = feature.subtasks.find(s => s.id === subtaskId)
    if (subtask) {
      subtask.completed = !subtask.completed
      // Recalculate progress
      const completedCount = feature.subtasks.filter(s => s.completed).length
      feature.progress = Math.round((completedCount / feature.subtasks.length) * 100)
      
      // Update phase progress
      updatePhaseProgress(feature.phase)
    }
  }
}

const updatePhaseProgress = (phaseId: string) => {
  const phaseFeatures = features.value.filter(f => f.phase === phaseId)
  const phase = phases.value.find(p => p.id === phaseId)
  if (phase && phaseFeatures.length > 0) {
    const totalProgress = phaseFeatures.reduce((sum, f) => sum + f.progress, 0)
    phase.progress = Math.round(totalProgress / phaseFeatures.length)
    
    // Update phase status
    if (phase.progress === 0) {
      phase.status = 'Not Started'
    } else if (phase.progress === 100) {
      phase.status = 'Completed'
    } else {
      phase.status = 'In Progress'
    }
  }
}

const updateFeatureStatus = (featureId: string) => {
  const feature = features.value.find(f => f.id === featureId)
  if (feature) {
    // Cycle through statuses
    switch (feature.status) {
      case 'not-started':
        feature.status = 'in-progress'
        break
      case 'in-progress':
        feature.status = 'completed'
        feature.progress = 100
        break
      case 'completed':
        feature.status = 'not-started'
        feature.progress = 0
        break
    }
    feature.updatedAt = new Date()
    updatePhaseProgress(feature.phase)
  }
}

const formatDate = (date: Date) => {
  return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
    Math.round((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
    'day'
  )
}
</script>
# Dashboard Layer Documentation

> Layer: `/layers/dashboard/`  
> Purpose: Client portal and project management  
> Routes: `/dashboard/*`  
> Access: Authenticated users (CLIENT role and above)

## Overview

The Dashboard Layer provides a comprehensive client portal where authenticated users can manage their projects, submit support tickets, view project progress, and update their profile settings. It serves as the primary interface for client-agency interaction.

## Features

### ✅ Implemented Features

#### Dashboard Overview
- **Dashboard Home** (`/dashboard/`) - Personalized overview with recent projects and tickets
- **Quick Stats** - Project counts, ticket summaries, recent activity
- **Recent Activity** - Latest updates on projects and support tickets

#### Project Management
- **Project List** (`/dashboard/projects/`) - All user projects with status filtering
- **Project Details** (`/dashboard/projects/[id]`) - Comprehensive project view
- **Create Project** (`/dashboard/projects/new`) - New project request form
- **Project Status Tracking** - Real-time status updates from agency

#### Support Ticket System
- **Ticket List** (`/dashboard/tickets/`) - All support tickets with status filtering
- **Ticket Details** (`/dashboard/tickets/[id]`) - Full conversation view
- **Create Ticket** - Submit new support requests
- **Comment System** - Real-time communication with support team

#### User Profile Management
- **Settings Page** (`/dashboard/settings`) - Profile and account management
- **Profile Updates** - Edit name, company, contact information
- **Password Change** - Secure password update functionality
- **Account Information** - View account status and verification info

### 🚧 In Progress / Planned
- File upload system for projects
- Invoice viewing and payment
- Project timeline visualization
- Advanced notification system
- Mobile-optimized interface

## Architecture

### Layer Structure
```
dashboard/
├── nuxt.config.ts              # Dashboard layer configuration
├── pages/dashboard/            # Dashboard routes
│   ├── index.vue               # Dashboard home
│   ├── projects/               # Project management
│   ├── tickets/                # Support system
│   └── settings.vue            # User settings
├── components/                 # Dashboard-specific components
├── composables/                # Dashboard utilities
├── server/api/                 # Dashboard API endpoints
├── stores/                     # Client-side state management
└── types/                      # Dashboard type definitions
```

### Data Flow
```
Client → Dashboard Pages → API Endpoints → Database
     ← UI Updates    ← JSON Response ← Query Results
```

### State Management
- **Project Store** (`stores/projectStore.ts`) - Project state and operations
- **Ticket Store** (`stores/ticketStore.ts`) - Ticket management state
- **User State** - Global user state from auth layer

## API Endpoints

### Base Path: `/api/`

#### Project Management
```typescript
GET /api/projects
// Get user's projects (clients) or all projects (admins)
Response: {
  projects: Project[]
}

GET /api/projects/[id]
// Get specific project details
Response: {
  project: Project & { client?: User }
}

POST /api/projects
// Create new project
Body: {
  title: string,
  description?: string,
  type: ProjectType,
  budget?: number,
  requirements?: string,
  startDate?: string,
  endDate?: string
}

PATCH /api/projects/[id]
// Update project (limited fields for clients)
Body: {
  title?: string,
  description?: string,
  requirements?: string
}
```

#### Support Tickets
```typescript
GET /api/tickets
// Get user's tickets (clients) or all tickets (admins)
Response: {
  tickets: (Ticket & {
    client?: User,
    _count: { comments: number }
  })[]
}

GET /api/tickets/[ticketId]
// Get ticket details with comments
Response: {
  ticket: Ticket & {
    client?: User,
    comments: (TicketComment & { user: User })[]
  }
}

POST /api/tickets
// Create new support ticket
Body: {
  subject: string,
  description: string
}

POST /api/tickets/[ticketId]/comment
// Add comment to ticket
Body: {
  content: string
}
```

#### Profile Management
```typescript
PATCH /api/profile
// Update user profile
Body: {
  name?: string,
  company?: string
}

POST /api/profile/change-password
// Change user password
Body: {
  currentPassword: string,
  newPassword: string
}
```

## Components

### Dashboard Components

#### Project Components
```vue
<!-- Project list with filtering and search -->
<template>
  <div class="space-y-4">
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold">Projects</h2>
      <Button @click="navigateTo('/dashboard/projects/new')">
        New Project
      </Button>
    </div>
    
    <ProjectFilters v-model="filters" />
    <ProjectList :projects="filteredProjects" />
  </div>
</template>
```

#### Ticket Components
```vue
<!-- Support ticket interface -->
<template>
  <div class="space-y-4">
    <TicketHeader :ticket="ticket" />
    <TicketConversation :comments="ticket.comments" />
    <TicketReplyForm @reply="addComment" />
  </div>
</template>
```

#### Settings Components

##### PasswordChangeForm.vue
```vue
<script setup lang="ts">
import { z } from 'zod'

const schema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

const changePassword = async (data: z.infer<typeof schema>) => {
  await $fetch('/api/profile/change-password', {
    method: 'POST',
    body: {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword
    }
  })
  
  toast({
    title: "Password Updated",
    description: "Your password has been changed successfully."
  })
}
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Change Password</CardTitle>
      <CardDescription>
        Update your account password
      </CardDescription>
    </CardHeader>
    
    <CardContent>
      <form @submit="handleSubmit(changePassword)">
        <div class="space-y-4">
          <FormField v-slot="{ componentField }" name="currentPassword">
            <FormItem>
              <FormLabel>Current Password</FormLabel>
              <FormControl>
                <Input type="password" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
          
          <FormField v-slot="{ componentField }" name="newPassword">
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <Input type="password" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
          
          <FormField v-slot="{ componentField }" name="confirmPassword">
            <FormItem>
              <FormLabel>Confirm New Password</FormLabel>
              <FormControl>
                <Input type="password" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
          
          <Button type="submit">Update Password</Button>
        </div>
      </form>
    </CardContent>
  </Card>
</template>
```

## Composables

### useTicketUtils.ts
```typescript
export const useTicketUtils = () => {
  const formatTicketStatus = (status: TicketStatus) => {
    const statusMap = {
      OPEN: { label: 'Open', class: 'bg-green-100 text-green-800' },
      PENDING: { label: 'Pending', class: 'bg-yellow-100 text-yellow-800' },
      RESOLVED: { label: 'Resolved', class: 'bg-blue-100 text-blue-800' },
      CLOSED: { label: 'Closed', class: 'bg-gray-100 text-gray-800' }
    }
    
    return statusMap[status] || statusMap.OPEN
  }

  const formatTicketNumber = (ticketNumber: string) => {
    return ticketNumber.toUpperCase()
  }

  const getTimeSince = (date: string) => {
    const now = new Date()
    const ticketDate = new Date(date)
    const diffInHours = Math.floor((now.getTime() - ticketDate.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Less than an hour ago'
    if (diffInHours < 24) return `${diffInHours} hours ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays} days ago`
  }

  return {
    formatTicketStatus,
    formatTicketNumber,
    getTimeSince
  }
}
```

## State Management

### Project Store (`stores/projectStore.ts`)
```typescript
export const useProjectStore = defineStore('projects', () => {
  const projects = ref<Project[]>([])
  const currentProject = ref<Project | null>(null)
  const loading = ref(false)

  const fetchProjects = async () => {
    loading.value = true
    try {
      const { projects: data } = await $fetch('/api/projects')
      projects.value = data
    } finally {
      loading.value = false
    }
  }

  const fetchProject = async (id: string) => {
    loading.value = true
    try {
      const { project } = await $fetch(`/api/projects/${id}`)
      currentProject.value = project
      return project
    } finally {
      loading.value = false
    }
  }

  const createProject = async (projectData: CreateProjectData) => {
    const { project } = await $fetch('/api/projects', {
      method: 'POST',
      body: projectData
    })
    
    projects.value.unshift(project)
    return project
  }

  const updateProject = async (id: string, updates: Partial<Project>) => {
    const { project } = await $fetch(`/api/projects/${id}`, {
      method: 'PATCH',
      body: updates
    })
    
    const index = projects.value.findIndex(p => p.id === id)
    if (index !== -1) {
      projects.value[index] = project
    }
    
    if (currentProject.value?.id === id) {
      currentProject.value = project
    }
    
    return project
  }

  const projectsByStatus = computed(() => {
    return projects.value.reduce((acc, project) => {
      if (!acc[project.status]) acc[project.status] = []
      acc[project.status].push(project)
      return acc
    }, {} as Record<ProjectStatus, Project[]>)
  })

  return {
    projects: readonly(projects),
    currentProject: readonly(currentProject),
    loading: readonly(loading),
    projectsByStatus,
    fetchProjects,
    fetchProject,
    createProject,
    updateProject
  }
})
```

### Ticket Store (`stores/ticketStore.ts`)
```typescript
export const useTicketStore = defineStore('tickets', () => {
  const tickets = ref<Ticket[]>([])
  const currentTicket = ref<(Ticket & { comments: TicketComment[] }) | null>(null)
  const loading = ref(false)

  const fetchTickets = async () => {
    loading.value = true
    try {
      const { tickets: data } = await $fetch('/api/tickets')
      tickets.value = data
    } finally {
      loading.value = false
    }
  }

  const fetchTicket = async (id: string) => {
    loading.value = true
    try {
      const { ticket } = await $fetch(`/api/tickets/${id}`)
      currentTicket.value = ticket
      return ticket
    } finally {
      loading.value = false
    }
  }

  const createTicket = async (ticketData: CreateTicketData) => {
    const { ticket } = await $fetch('/api/tickets', {
      method: 'POST',
      body: ticketData
    })
    
    tickets.value.unshift(ticket)
    return ticket
  }

  const addComment = async (ticketId: string, content: string) => {
    const { comment } = await $fetch(`/api/tickets/${ticketId}/comment`, {
      method: 'POST',
      body: { content }
    })
    
    if (currentTicket.value?.id === ticketId) {
      currentTicket.value.comments.push(comment)
    }
    
    return comment
  }

  const openTickets = computed(() => 
    tickets.value.filter(t => t.status === 'OPEN')
  )

  const resolvedTickets = computed(() => 
    tickets.value.filter(t => t.status === 'RESOLVED')
  )

  return {
    tickets: readonly(tickets),
    currentTicket: readonly(currentTicket),
    loading: readonly(loading),
    openTickets,
    resolvedTickets,
    fetchTickets,
    fetchTicket,
    createTicket,
    addComment
  }
})
```

## Page Structure

### Dashboard Home (`/dashboard/index.vue`)
```vue
<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

const { user } = useUserState()
const projectStore = useProjectStore()
const ticketStore = useTicketStore()

// Fetch user data on mount
await Promise.all([
  projectStore.fetchProjects(),
  ticketStore.fetchTickets()
])

const recentProjects = computed(() => 
  projectStore.projects.slice(0, 3)
)

const recentTickets = computed(() => 
  ticketStore.tickets.slice(0, 3)
)
</script>

<template>
  <div class="space-y-8">
    <div>
      <h1 class="text-3xl font-bold">
        Welcome back, {{ user?.name || 'User' }}!
      </h1>
      <p class="text-muted-foreground">
        Here's what's happening with your projects and support tickets.
      </p>
    </div>
    
    <!-- Quick Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader class="pb-2">
          <CardTitle class="text-sm font-medium">Active Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            {{ projectStore.projectsByStatus.IN_PROGRESS?.length || 0 }}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader class="pb-2">
          <CardTitle class="text-sm font-medium">Open Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            {{ ticketStore.openTickets.length }}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader class="pb-2">
          <CardTitle class="text-sm font-medium">Completed Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            {{ projectStore.projectsByStatus.COMPLETED?.length || 0 }}
          </div>
        </CardContent>
      </Card>
    </div>
    
    <!-- Recent Activity -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Recent Projects</CardTitle>
          <CardDescription>
            Your latest project updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div v-for="project in recentProjects" :key="project.id">
              <div class="flex items-center justify-between">
                <div>
                  <p class="font-medium">{{ project.title }}</p>
                  <p class="text-sm text-muted-foreground">
                    {{ formatProjectStatus(project.status) }}
                  </p>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <NuxtLink :to="`/dashboard/projects/${project.id}`">
                    View
                  </NuxtLink>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Tickets</CardTitle>
          <CardDescription>
            Your latest support conversations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div v-for="ticket in recentTickets" :key="ticket.id">
              <div class="flex items-center justify-between">
                <div>
                  <p class="font-medium">{{ ticket.subject }}</p>
                  <p class="text-sm text-muted-foreground">
                    {{ formatTicketStatus(ticket.status) }}
                  </p>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <NuxtLink :to="`/dashboard/tickets/${ticket.id}`">
                    View
                  </NuxtLink>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
```

### Project Management (`/dashboard/projects/index.vue`)
```vue
<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

const projectStore = useProjectStore()
const searchQuery = ref('')
const statusFilter = ref<ProjectStatus | 'ALL'>('ALL')

await projectStore.fetchProjects()

const filteredProjects = computed(() => {
  let filtered = projectStore.projects
  
  if (searchQuery.value) {
    filtered = filtered.filter(p => 
      p.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }
  
  if (statusFilter.value !== 'ALL') {
    filtered = filtered.filter(p => p.status === statusFilter.value)
  }
  
  return filtered
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold">Projects</h1>
      <Button asChild>
        <NuxtLink to="/dashboard/projects/new">
          New Project
        </NuxtLink>
      </Button>
    </div>
    
    <!-- Filters -->
    <div class="flex gap-4">
      <div class="flex-1">
        <Input 
          v-model="searchQuery"
          placeholder="Search projects..."
        />
      </div>
      <Select v-model="statusFilter">
        <SelectTrigger class="w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Projects</SelectItem>
          <SelectItem value="PENDING">Pending</SelectItem>
          <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
          <SelectItem value="COMPLETED">Completed</SelectItem>
        </SelectContent>
      </Select>
    </div>
    
    <!-- Project Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card 
        v-for="project in filteredProjects" 
        :key="project.id"
        class="cursor-pointer hover:shadow-md transition-shadow"
        @click="navigateTo(`/dashboard/projects/${project.id}`)"
      >
        <CardHeader>
          <CardTitle>{{ project.title }}</CardTitle>
          <CardDescription>
            {{ project.description || 'No description' }}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div class="flex items-center justify-between">
            <Badge :variant="getStatusVariant(project.status)">
              {{ formatProjectStatus(project.status) }}
            </Badge>
            <span class="text-sm text-muted-foreground">
              {{ formatProjectType(project.type) }}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
    
    <!-- Empty State -->
    <div v-if="filteredProjects.length === 0" class="text-center py-12">
      <p class="text-muted-foreground mb-4">No projects found</p>
      <Button asChild>
        <NuxtLink to="/dashboard/projects/new">
          Create Your First Project
        </NuxtLink>
      </Button>
    </div>
  </div>
</template>
```

## Security & Access Control

### Route Protection
All dashboard routes are protected by the `auth` middleware:
```typescript
// Automatically applied to all /dashboard/* routes
definePageMeta({
  middleware: 'auth'
})
```

### API Authorization
Server endpoints validate user sessions and ownership:
```typescript
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  
  if (!session?.user) {
    throw createError({ statusCode: 401 })
  }
  
  // For user-specific resources, check ownership
  const project = await getProject(projectId)
  if (project.clientId !== session.user.id && !isAdmin(session.user)) {
    throw createError({ statusCode: 403 })
  }
})
```

## Performance Optimizations

### Client-Side Caching
- Pinia stores cache fetched data
- Optimistic updates for better UX
- Background refresh of stale data

### Database Queries
- Efficient joins for related data
- Pagination for large datasets
- Indexed columns for fast lookups

### Loading States
- Skeleton components during data fetching
- Progressive loading for large lists
- Lazy loading for secondary content

## Future Enhancements

### Advanced Project Management
- **File Upload System** - Attach files to projects
- **Project Timeline** - Gantt chart visualization
- **Milestone Tracking** - Project phase management
- **Collaboration Tools** - Client-agency communication

### Enhanced User Experience
- **Real-time Updates** - Live project/ticket updates
- **Mobile App** - Native mobile experience
- **Offline Support** - PWA functionality
- **Advanced Notifications** - Email and push notifications

### Business Features
- **Invoice Integration** - View and pay invoices
- **Contract Management** - Digital contract signing
- **Time Tracking** - Project time visibility
- **Reporting** - Custom project reports

This dashboard layer provides a solid foundation for client-agency interaction with extensive opportunities for feature enhancement and improved user experience.
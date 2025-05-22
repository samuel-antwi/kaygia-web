# Admin Layer Documentation

> Layer: `/layers/admin/`  
> Purpose: Administrative management system  
> Routes: `/admin/*`  
> Access: ADMIN and SUPER_ADMIN roles only

## Overview

The Admin Layer provides a comprehensive administrative interface for managing users, projects, and support tickets. It includes role-based access control, system analytics, and complete CRUD operations for all entities.

## Features

### ✅ Implemented Features

#### Dashboard & Analytics
- **Admin Dashboard** (`/admin/`) - System overview with key metrics
- **User Statistics** - Total users, active users, role distribution
- **Project Statistics** - Project counts by status and type
- **Ticket Statistics** - Support ticket metrics and resolution rates
- **Recent Activity** - Latest users, projects, and tickets

#### User Management
- **User List** (`/admin/users/`) - Paginated user directory with search
- **User Details** (`/admin/users/[id]`) - Comprehensive user profiles
- **User Creation** (`/admin/users/create`) - Create new user accounts
- **Role Management** - Assign CLIENT, ADMIN, SUPER_ADMIN roles
- **Account Status** - Activate/deactivate user accounts
- **Email Verification** - Manually verify user emails
- **Password Management** - Force password resets for users

#### Project Management
- **Project List** (`/admin/projects/`) - All projects with filtering
- **Project Details** (`/admin/projects/[id]`) - Project oversight
- **Status Updates** - Change project status (PENDING → COMPLETED)
- **Client Association** - View project-client relationships
- **Project Analytics** - Budget tracking, timeline management

#### Support Ticket Management
- **Ticket List** (`/admin/tickets/`) - All support tickets
- **Ticket Details** (`/admin/tickets/[id]`) - Full ticket conversations
- **Status Management** - Update ticket status (OPEN → RESOLVED)
- **Admin Responses** - Reply to customer tickets
- **Ticket Assignment** - Internal ticket management

### 🚧 Planned Enhancements
- Advanced user role system
- Audit logging for admin actions
- Bulk operations (bulk user import, mass emails)
- Advanced analytics and reporting
- System health monitoring

## Architecture

### Layer Structure
```
admin/
├── nuxt.config.ts              # Admin layer configuration
├── middleware/
│   └── admin-only.global.ts    # Admin access protection
├── pages/admin/                # Admin routes
├── components/users/           # User management components
├── server/api/admin/           # Admin API endpoints
├── composables/                # Admin utilities
├── stores/                     # Admin state (if needed)
├── types/                      # Admin-specific types
└── utils/                      # Admin helper functions
```

### Security Model

#### Access Control
- **Global Middleware**: `admin-only.global.ts` protects all `/admin/*` routes
- **Role Validation**: SERVER-SIDE validation in all admin API endpoints
- **Session Verification**: Ensures user is authenticated and has admin privileges

#### Permission Levels
```typescript
enum Role {
  CLIENT = "CLIENT",        // No admin access
  ADMIN = "ADMIN",          // Full admin access
  SUPER_ADMIN = "SUPER_ADMIN" // Full admin access + additional privileges
}
```

#### Security Implementation
```typescript
// middleware/admin-only.global.ts
export default defineNuxtRouteMiddleware((to) => {
  if (to.path.startsWith('/admin')) {
    const { user } = useUserState()
    
    if (!user.value || !['ADMIN', 'SUPER_ADMIN'].includes(user.value.role)) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Admin access required'
      })
    }
  }
})
```

## API Endpoints

### Base Path: `/api/admin/`

#### Dashboard Analytics
```typescript
GET /api/admin/dashboard/stats
// Returns system statistics
Response: {
  users: { total, clients, admins, active },
  projects: { total, active, completed, pending },
  tickets: { total, open, resolved }
}

GET /api/admin/dashboard/activity  
// Returns recent activity
Response: {
  recentUsers: User[],
  recentProjects: Project[],
  recentTickets: Ticket[]
}
```

#### User Management
```typescript
GET /api/admin/users
// Get all users with filtering
Query: ?role=CLIENT&active=true&search=john

POST /api/admin/users
// Create new user
Body: { email, name, company?, role, password? }

GET /api/admin/users/[userId]
// Get user details with projects and tickets

PUT /api/admin/users/[userId]/role
// Update user role
Body: { role: 'ADMIN' | 'CLIENT' | 'SUPER_ADMIN' }

PUT /api/admin/users/[userId]/toggle-active
// Toggle user active status

PUT /api/admin/users/[userId]/verify-email
// Manually verify user email

POST /api/admin/users/[userId]/reset-password
// Generate password reset for user

POST /api/admin/users/[userId]/resend-verification
// Resend verification email
```

#### Project Management
```typescript
GET /api/admin/projects
// Get all projects with client info
Query: ?status=IN_PROGRESS&type=WEBSITE&clientId=user123

GET /api/admin/projects/[id]
// Get project details with client and tickets

PUT /api/admin/projects/[id]/status
// Update project status
Body: { status: 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED' }
```

#### Ticket Management
```typescript
GET /api/admin/tickets
// Get all tickets with client info and comment counts
Query: ?status=OPEN&clientId=user123

GET /api/admin/tickets/[ticketId]
// Get ticket with full conversation

PUT /api/admin/tickets/[ticketId]/status
// Update ticket status
Body: { status: 'OPEN' | 'RESOLVED' | 'CLOSED' }

POST /api/admin/tickets/[ticketId]/comment
// Add admin response to ticket
Body: { content: string }
```

## Components

### User Management Components

#### UserProfile.vue
Displays comprehensive user information including projects and tickets.

```vue
<script setup lang="ts">
interface Props {
  user: User & {
    projects: Project[]
    tickets: Ticket[]
  }
}
</script>
```

#### UserCreationForm.vue  
Form for creating new user accounts with role assignment.

```vue
<script setup lang="ts">
const createUser = async (userData: CreateUserData) => {
  await $fetch('/api/admin/users', {
    method: 'POST',
    body: userData
  })
}
</script>
```

#### RoleManagement.vue
Interface for updating user roles with proper validation.

#### AccountStatusManagement.vue
Toggle user account activation status.

#### EmailVerificationManagement.vue
Manage user email verification status and resend verification emails.

#### PasswordManagement.vue
Admin interface for triggering password resets for users.

### Analytics Components

#### UserStats.vue
Displays user metrics and distribution charts.

#### RecentItems.vue
Shows recent activity across users, projects, and tickets.

## Composables

### useAdminUtils.ts
```typescript
export const useAdminUtils = () => {
  const updateUserRole = async (userId: string, role: Role) => {
    return await $fetch(`/api/admin/users/${userId}/role`, {
      method: 'PUT',
      body: { role }
    })
  }

  const toggleUserActive = async (userId: string) => {
    return await $fetch(`/api/admin/users/${userId}/toggle-active`, {
      method: 'PUT'
    })
  }

  return {
    updateUserRole,
    toggleUserActive
  }
}
```

### useFormatting.ts
```typescript
export const useFormatting = () => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-GB')
  }

  return {
    formatCurrency,
    formatDate
  }
}
```

## Page Structure

### Admin Dashboard (`/admin/index.vue`)
```vue
<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <UserStats :stats="stats.users" />
      <ProjectStats :stats="stats.projects" />
      <TicketStats :stats="stats.tickets" />
    </div>
    
    <RecentItems :activity="activity" />
  </div>
</template>
```

### User Management (`/admin/users/index.vue`)
```vue
<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">User Management</h1>
      <Button @click="navigateTo('/admin/users/create')">
        Create User
      </Button>
    </div>
    
    <UserTable :users="users" @update-role="handleRoleUpdate" />
  </div>
</template>
```

### User Details (`/admin/users/[id].vue`)
```vue
<template>
  <div class="space-y-6">
    <UserProfile :user="user" />
    <RoleManagement :user="user" @role-updated="refreshUser" />
    <AccountStatusManagement :user="user" @status-updated="refreshUser" />
    <EmailVerificationManagement :user="user" />
    <PasswordManagement :user="user" />
  </div>
</template>
```

## Development Guidelines

### Adding New Admin Features

1. **Create API Endpoint**:
   ```typescript
   // layers/admin/server/api/admin/new-feature.get.ts
   export default defineEventHandler(async (event) => {
     const session = await getUserSession(event)
     
     // Validate admin access
     if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
       throw createError({
         statusCode: 403,
         statusMessage: 'Admin access required'
       })
     }
     
     // Implement feature logic
   })
   ```

2. **Create Page Component**:
   ```vue
   <!-- layers/admin/pages/admin/new-feature.vue -->
   <script setup lang="ts">
   definePageMeta({
     layout: 'admin'
   })
   
   // Component logic
   </script>
   ```

3. **Add Navigation**:
   Update admin layout to include new feature in navigation.

### Security Considerations

#### Always Validate Permissions
```typescript
// In every admin API endpoint
const session = await getUserSession(event)
if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
  throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
}
```

#### Audit Sensitive Operations
```typescript
// Log admin actions for security
console.log(`Admin ${session.user.id} updated user ${userId} role to ${newRole}`)
```

## Testing Admin Features

### Manual Testing Checklist

#### User Management
- [ ] Create new user with different roles
- [ ] Update user roles (CLIENT ↔ ADMIN)
- [ ] Activate/deactivate user accounts
- [ ] Verify email verification management
- [ ] Test password reset functionality

#### Project Management
- [ ] View all projects with proper filtering
- [ ] Update project statuses
- [ ] Verify client-project associations

#### Ticket Management
- [ ] View all tickets with filtering
- [ ] Respond to tickets as admin
- [ ] Update ticket statuses
- [ ] Verify proper conversation threading

### Access Control Testing
```bash
# Test admin access protection
curl -X GET http://localhost:3000/api/admin/users
# Should return 401/403 without admin session

# Test with admin credentials
# Should return user data
```

## Performance Considerations

### Database Queries
- Use efficient joins for user-project-ticket relationships
- Implement pagination for large datasets
- Add database indexes for admin queries

### Caching
- Cache dashboard statistics (refresh every 5 minutes)
- Cache user counts and metrics
- Use optimistic updates for real-time feel

### UI Performance
- Lazy load user/project/ticket lists
- Implement virtual scrolling for large tables
- Use skeleton loading states

## Future Enhancements

### Advanced User Management
- Bulk user operations (import/export)
- Advanced role system with custom permissions
- User session management (force logout)

### Analytics & Reporting
- Advanced dashboard with charts
- Export capabilities (CSV, PDF)
- Custom date range filtering
- Performance metrics

### System Administration
- Application settings management
- Email template customization
- System health monitoring
- Database maintenance tools

This admin layer provides a solid foundation for managing the Kaygia Web platform with room for extensive future enhancements.
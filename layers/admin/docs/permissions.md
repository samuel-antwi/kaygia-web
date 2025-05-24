# Admin Permissions Guide

## Role Hierarchy

### CLIENT
- Access to dashboard
- View and manage own projects
- Submit support tickets
- Update own profile

### ADMIN
- All CLIENT permissions, plus:
- Access to admin dashboard
- View all users (read-only)
- View all projects
- Manage project details (status, updates, files)
- View support tickets
- Cannot edit or delete users
- Cannot change user roles

### SUPER_ADMIN
- All ADMIN permissions, plus:
- Edit user profiles
- Delete users
- Change user roles
- Manage system settings
- Full system access

## Permission Functions

| Function | CLIENT | ADMIN | SUPER_ADMIN |
|----------|--------|-------|-------------|
| `hasAdminAccess()` | ❌ | ✅ | ✅ |
| `isSuperAdmin()` | ❌ | ❌ | ✅ |
| `canEditUsers()` | ❌ | ❌ | ✅ |
| `canDeleteUsers()` | ❌ | ❌ | ✅ |
| `canManageProjects()` | ❌ | ✅ | ✅ |
| `canViewAdminDashboard()` | ❌ | ✅ | ✅ |
| `canManageSystemSettings()` | ❌ | ❌ | ✅ |

## Implementation Example

```typescript
// In an API endpoint
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);
  
  // Check if user can edit other users
  if (!canEditUsers(session.user?.role)) {
    throw createError({
      statusCode: 403,
      statusMessage: "Only super admins can edit user profiles"
    });
  }
  
  // Proceed with user edit...
});
```

## UI Component Example

```vue
<template>
  <div>
    <!-- Only show edit button for super admins -->
    <Button 
      v-if="canEditUsers(user.role)"
      @click="editUser"
    >
      Edit User
    </Button>
    
    <!-- Show for all admins -->
    <Button 
      v-if="canManageProjects(user.role)"
      @click="manageProject"
    >
      Manage Project
    </Button>
  </div>
</template>

<script setup>
import { canEditUsers, canManageProjects } from '~/layers/admin/utils/adminAccess';
const { user } = useAuth();
</script>
```
# API Documentation

> Last updated: January 2025  
> Base URL: `/api`  
> Authentication: Session-based with cookies

## Overview

Kaygia Web API is organized into layer-based modules with consistent patterns for authentication, validation, and error handling. All endpoints use TypeScript with Zod validation and return JSON responses.

## Authentication

### Session Management
- **Type**: Cookie-based sessions with `nuxt-auth-utils`
- **Duration**: 7 days
- **Access**: `const session = await getUserSession(event)` in server routes
- **Security**: HTTP-only, secure cookies

### Role-Based Access
```typescript
enum Role {
  CLIENT = "CLIENT",
  ADMIN = "ADMIN", 
  SUPER_ADMIN = "SUPER_ADMIN"
}
```

## API Structure

### Layer Organization
```
/api/
├── auth/           # Authentication endpoints (auth layer)
├── user/           # User profile endpoints (auth layer)
├── admin/          # Admin management (admin layer)
├── projects/       # Project management (dashboard layer)
├── tickets/        # Support tickets (dashboard layer)
├── profile/        # User profile updates (dashboard layer)
└── messages/       # Messaging system (dashboard layer)
```

## Core Endpoints

### Authentication (`/api/auth/`)

#### POST `/api/auth/register`
Create new user account with email verification.

**Request Body:**
```typescript
{
  email: string;      // Valid email address
  password: string;   // Min 8 characters
  name?: string;      // Optional full name
  company?: string;   // Optional company name
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  requiresVerification: true;
}
```

**Status Codes:**
- `201`: User created successfully
- `400`: Invalid input data
- `409`: Email already exists

#### POST `/api/auth/login`
Authenticate user and create session.

**Request Body:**
```typescript
{
  email: string;
  password: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  user: {
    id: string;
    email: string;
    name: string;
    role: Role;
    emailVerified: boolean;
  };
}
```

**Status Codes:**
- `200`: Login successful
- `401`: Invalid credentials
- `403`: Email not verified or account inactive

#### POST `/api/auth/logout`
End user session.

**Authentication:** Required  
**Response:**
```typescript
{
  success: boolean;
}
```

#### POST `/api/auth/reset-password`
Request password reset email.

**Request Body:**
```typescript
{
  email: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
}
```

#### POST `/api/auth/complete-reset`
Complete password reset with token.

**Request Body:**
```typescript
{
  token: string;
  newPassword: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
}
```

#### POST `/api/auth/verify-email`
Verify email address with token.

**Request Body:**
```typescript
{
  token: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
}
```

#### POST `/api/auth/resend-verification`
Resend email verification.

**Authentication:** Required  
**Request Body:**
```typescript
{
  email: string;
}
```

### User Profile (`/api/user/`)

#### GET `/api/user/profile`
Get current user profile.

**Authentication:** Required  
**Response:**
```typescript
{
  id: string;
  email: string;
  name: string;
  company: string;
  role: Role;
  emailVerified: boolean;
  active: boolean;
  createdAt: string;
  lastLoggedIn: string;
}
```

### Admin Management (`/api/admin/`)

**Authentication:** ADMIN or SUPER_ADMIN required

#### Dashboard Endpoints

##### GET `/api/admin/dashboard/stats`
Get admin dashboard statistics.

**Response:**
```typescript
{
  users: {
    total: number;
    clients: number;
    admins: number;
    active: number;
  };
  projects: {
    total: number;
    active: number;
    completed: number;
    pending: number;
  };
  tickets: {
    total: number;
    open: number;
    resolved: number;
  };
}
```

##### GET `/api/admin/dashboard/activity`
Get recent system activity.

**Response:**
```typescript
{
  recentUsers: User[];
  recentProjects: Project[];
  recentTickets: Ticket[];
}
```

#### User Management

##### GET `/api/admin/users`
Get all users with filtering.

**Query Parameters:**
- `role?: Role` - Filter by user role
- `active?: boolean` - Filter by active status
- `search?: string` - Search by name or email

**Response:**
```typescript
{
  users: User[];
  total: number;
}
```

##### GET `/api/admin/users/[userId]`
Get specific user details.

**Response:**
```typescript
{
  user: User & {
    projects: Project[];
    tickets: Ticket[];
  };
}
```

##### POST `/api/admin/users`
Create new user account.

**Request Body:**
```typescript
{
  email: string;
  name: string;
  company?: string;
  role: Role;
  password?: string; // Optional, will be generated if not provided
}
```

##### PUT `/api/admin/users/[userId]/role`
Update user role.

**Request Body:**
```typescript
{
  role: Role;
}
```

##### PUT `/api/admin/users/[userId]/toggle-active`
Toggle user active status.

**Response:**
```typescript
{
  success: boolean;
  active: boolean;
}
```

##### PUT `/api/admin/users/[userId]/verify-email`
Manually verify user email.

##### POST `/api/admin/users/[userId]/reset-password`
Generate password reset for user.

##### POST `/api/admin/users/[userId]/resend-verification`
Resend verification email for user.

#### Project Management

##### GET `/api/admin/projects`
Get all projects with filtering.

**Query Parameters:**
- `status?: ProjectStatus` - Filter by project status
- `type?: ProjectType` - Filter by project type
- `clientId?: string` - Filter by client

**Response:**
```typescript
{
  projects: (Project & { client: User })[];
  total: number;
}
```

##### GET `/api/admin/projects/[id]`
Get project details.

**Response:**
```typescript
{
  project: Project & {
    client: User;
    tickets: Ticket[];
  };
}
```

##### PUT `/api/admin/projects/[id]/status`
Update project status.

**Request Body:**
```typescript
{
  status: ProjectStatus;
}
```

#### Ticket Management

##### GET `/api/admin/tickets`
Get all support tickets.

**Query Parameters:**
- `status?: TicketStatus` - Filter by ticket status
- `clientId?: string` - Filter by client

**Response:**
```typescript
{
  tickets: (Ticket & { 
    client: User;
    _count: { comments: number };
  })[];
  total: number;
}
```

##### GET `/api/admin/tickets/[ticketId]`
Get ticket details with comments.

**Response:**
```typescript
{
  ticket: Ticket & {
    client: User;
    comments: (TicketComment & { user: User })[];
  };
}
```

##### PUT `/api/admin/tickets/[ticketId]/status`
Update ticket status.

**Request Body:**
```typescript
{
  status: TicketStatus;
}
```

##### POST `/api/admin/tickets/[ticketId]/comment`
Add admin comment to ticket.

**Request Body:**
```typescript
{
  content: string;
}
```

### Project Management (`/api/projects/`)

**Authentication:** Required (CLIENT role can only access own projects)

##### GET `/api/projects`
Get user's projects or all projects (admin).

**Response:**
```typescript
{
  projects: Project[];
}
```

##### GET `/api/projects/[id]`
Get specific project details.

**Response:**
```typescript
{
  project: Project & {
    client?: User; // Only for admins
  };
}
```

##### POST `/api/projects`
Create new project.

**Request Body:**
```typescript
{
  title: string;
  description?: string;
  type: ProjectType;
  budget?: number;
  requirements?: string;
  startDate?: string;
  endDate?: string;
}
```

##### PATCH `/api/projects/[id]`
Update project (limited fields for clients).

**Request Body:**
```typescript
{
  title?: string;
  description?: string;
  requirements?: string;
  // Admins can also update: status, budget, dates
}
```

### Support Tickets (`/api/tickets/`)

**Authentication:** Required

##### GET `/api/tickets`
Get user's tickets or all tickets (admin).

**Response:**
```typescript
{
  tickets: (Ticket & {
    client?: User; // Only for admins
    _count: { comments: number };
  })[];
}
```

##### GET `/api/tickets/[ticketId]`
Get ticket details with comments.

**Response:**
```typescript
{
  ticket: Ticket & {
    client?: User; // Only for admins
    comments: (TicketComment & { user: User })[];
  };
}
```

##### POST `/api/tickets`
Create new support ticket.

**Request Body:**
```typescript
{
  subject: string;
  description: string;
}
```

##### POST `/api/tickets/[ticketId]/comment`
Add comment to ticket.

**Request Body:**
```typescript
{
  content: string;
}
```

### Profile Management (`/api/profile/`)

**Authentication:** Required

##### PATCH `/api/profile`
Update user profile.

**Request Body:**
```typescript
{
  name?: string;
  company?: string;
}
```

##### POST `/api/profile/change-password`
Change user password.

**Request Body:**
```typescript
{
  currentPassword: string;
  newPassword: string;
}
```

## Error Handling

### Standard Error Response
```typescript
{
  success: false;
  message: string;
  errors?: string[]; // Validation errors
}
```

### HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (not logged in)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `409`: Conflict (duplicate data)
- `500`: Internal Server Error

### Validation Errors
All endpoints use Zod validation with detailed error messages:
```typescript
{
  success: false;
  message: "Validation failed",
  errors: [
    "Email is required",
    "Password must be at least 8 characters"
  ]
}
```

## Rate Limiting

**Status**: Not implemented ⚠️  
**Planned**: API rate limiting by IP and user

## Common Headers

### Request Headers
```http
Content-Type: application/json
Cookie: nuxt-session=... // Automatically handled
```

### Response Headers
```http
Content-Type: application/json
Set-Cookie: nuxt-session=... // On authentication
```

## Security Features

### Implemented
- ✅ Session-based authentication
- ✅ Password hashing (bcrypt)
- ✅ Input validation (Zod)
- ✅ Role-based access control
- ✅ CSRF protection
- ✅ Secure cookie settings

### Planned
- ⏳ API rate limiting
- ⏳ Request logging
- ⏳ IP-based security
- ⏳ Enhanced CORS settings

## Development Notes

### Adding New Endpoints
1. Create endpoint in appropriate layer (`layers/*/server/api/`)
2. Add Zod validation schema
3. Implement proper error handling
4. Add role-based authorization
5. Update this documentation

### Testing Endpoints
```bash
# Using curl
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

### Session Access Pattern
```typescript
// In any server route
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);
  
  if (!session?.user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    });
  }
  
  // Use session.user.id, session.user.role, etc.
});
```
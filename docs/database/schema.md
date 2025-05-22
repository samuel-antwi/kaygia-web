# Database Schema Documentation

> Last updated: January 2025  
> Database: PostgreSQL with Drizzle ORM  
> Location: `server/db/schema.ts`

## Overview

The Kaygia Web database uses PostgreSQL with Drizzle ORM for type-safe database operations. The schema supports a multi-tenant web agency platform with client management, project tracking, and support systems.

## Entity Relationship Diagram

```
users (1) ──────── (M) projects
  │                     
  │ (1)                 
  │                     
  └── (M) support_tickets (1) ──── (M) ticket_comments
  │                                      │
  │ (1)                                  │ (M)
  │                                      │
  ├── (M) password_resets                └── users (FK)
  │
  └── (M) email_verifications
```

## Tables

### 1. users
**Purpose**: Core user entity for clients, admins, and super admins

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | text | PRIMARY KEY | UUID-style unique identifier |
| `email` | text | UNIQUE, NOT NULL | User email address |
| `name` | text | nullable | User full name |
| `company` | text | nullable | Company/organization name |
| `password_hash` | text | nullable | bcrypt hashed password |
| `created_at` | timestamp | DEFAULT now(), NOT NULL | Account creation time |
| `updated_at` | timestamp | DEFAULT now(), NOT NULL | Last profile update |
| `last_logged_in` | timestamp | nullable | Last successful login |
| `role` | role_enum | DEFAULT 'CLIENT', NOT NULL | User role (CLIENT/ADMIN/SUPER_ADMIN) |
| `email_verified` | boolean | DEFAULT false, NOT NULL | Email verification status |
| `active` | boolean | DEFAULT true, NOT NULL | Account activation status |

**Indexes Needed**:
```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(active);
```

### 2. projects
**Purpose**: Client projects and development work tracking

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | text | PRIMARY KEY | UUID-style unique identifier |
| `title` | text | NOT NULL | Project name/title |
| `description` | text | nullable | Project description |
| `status` | project_status_enum | DEFAULT 'PENDING', NOT NULL | Current project status |
| `client_id` | text | NOT NULL, FK → users.id CASCADE | Project owner |
| `created_at` | timestamp | DEFAULT now(), NOT NULL | Project creation time |
| `updated_at` | timestamp | DEFAULT now(), NOT NULL | Last project update |
| `start_date` | timestamp | nullable | Project start date |
| `end_date` | timestamp | nullable | Project completion date |
| `type` | project_type_enum | NOT NULL | Type of project |
| `budget` | real | nullable | Project budget (£) |
| `requirements` | text | nullable | Project requirements |

**Indexes Needed**:
```sql
CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_type ON projects(type);
CREATE INDEX idx_projects_client_status ON projects(client_id, status);
```

### 3. support_tickets
**Purpose**: Customer support and communication system

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | text | PRIMARY KEY | UUID-style unique identifier |
| `ticket_number` | text | UNIQUE, NOT NULL | Human-readable ticket number |
| `subject` | text | NOT NULL | Ticket subject line |
| `description` | text | NOT NULL | Ticket description |
| `status` | ticket_status_enum | DEFAULT 'OPEN', NOT NULL | Current ticket status |
| `client_id` | text | NOT NULL, FK → users.id CASCADE | Ticket creator |
| `created_at` | timestamp | DEFAULT now(), NOT NULL | Ticket creation time |
| `updated_at` | timestamp | DEFAULT now(), NOT NULL | Last ticket update |
| `last_replied_at` | timestamp | nullable | Last reply timestamp |

**Indexes Needed**:
```sql
CREATE INDEX idx_support_tickets_client_id ON support_tickets(client_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_ticket_number ON support_tickets(ticket_number);
CREATE INDEX idx_tickets_client_status ON support_tickets(client_id, status);
```

### 4. ticket_comments
**Purpose**: Communication thread for support tickets

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | text | PRIMARY KEY | UUID-style unique identifier |
| `content` | text | NOT NULL | Comment content |
| `ticket_id` | text | NOT NULL, FK → support_tickets.id CASCADE | Associated ticket |
| `user_id` | text | NOT NULL, FK → users.id CASCADE | Comment author |
| `sender` | comment_sender_enum | NOT NULL | Sender type (CLIENT/ADMIN) |
| `created_at` | timestamp | DEFAULT now(), NOT NULL | Comment creation time |
| `updated_at` | timestamp | DEFAULT now(), NOT NULL | Last comment update |

**Indexes Needed**:
```sql
CREATE INDEX idx_ticket_comments_ticket_id ON ticket_comments(ticket_id);
CREATE INDEX idx_ticket_comments_user_id ON ticket_comments(user_id);
CREATE INDEX idx_ticket_comments_created_at ON ticket_comments(created_at);
```

### 5. password_resets
**Purpose**: Secure password reset token management

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | text | PRIMARY KEY | UUID-style unique identifier |
| `token` | text | NOT NULL | Reset token (should be hashed) |
| `user_id` | text | NOT NULL, FK → users.id CASCADE | Target user |
| `expires_at` | timestamp | NOT NULL | Token expiration time |
| `used` | boolean | DEFAULT false, NOT NULL | Token usage status |
| `created_at` | timestamp | DEFAULT now(), NOT NULL | Token creation time |

**Indexes Needed**:
```sql
CREATE INDEX idx_password_resets_token ON password_resets(token);
CREATE INDEX idx_password_resets_user_id ON password_resets(user_id);
CREATE INDEX idx_password_resets_expires_at ON password_resets(expires_at);
```

### 6. email_verifications
**Purpose**: Email verification token management

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | text | PRIMARY KEY | UUID-style unique identifier |
| `token` | text | NOT NULL | Verification token (should be hashed) |
| `user_id` | text | NOT NULL, FK → users.id CASCADE | Target user |
| `expires_at` | timestamp | NOT NULL | Token expiration time |
| `used` | boolean | DEFAULT false, NOT NULL | Token usage status |
| `created_at` | timestamp | DEFAULT now(), NOT NULL | Token creation time |

**Indexes Needed**:
```sql
CREATE INDEX idx_email_verifications_token ON email_verifications(token);
CREATE INDEX idx_email_verifications_user_id ON email_verifications(user_id);
CREATE INDEX idx_email_verifications_expires_at ON email_verifications(expires_at);
```

## Enums

### role_enum
```sql
CREATE TYPE role AS ENUM ('CLIENT', 'ADMIN', 'SUPER_ADMIN');
```

**Values**:
- `CLIENT`: Regular client users
- `ADMIN`: Administrative users  
- `SUPER_ADMIN`: Super administrative users

### project_status_enum
```sql
CREATE TYPE project_status AS ENUM (
  'PENDING', 'APPROVED', 'IN_PROGRESS', 
  'REVIEW', 'COMPLETED', 'CANCELLED'
);
```

**Values**:
- `PENDING`: Awaiting approval
- `APPROVED`: Approved and ready to start
- `IN_PROGRESS`: Currently being worked on
- `REVIEW`: Under review/testing
- `COMPLETED`: Successfully completed
- `CANCELLED`: Project cancelled

### project_type_enum
```sql
CREATE TYPE project_type AS ENUM (
  'WEBSITE', 'E_COMMERCE', 'WEB_APP', 
  'MOBILE_APP', 'BRANDING', 'MARKETING', 'OTHER'
);
```

### ticket_status_enum
```sql
CREATE TYPE ticket_status AS ENUM ('OPEN', 'PENDING', 'RESOLVED', 'CLOSED');
```

**Values**:
- `OPEN`: New/active ticket
- `PENDING`: Awaiting response
- `RESOLVED`: Issue resolved
- `CLOSED`: Ticket closed

### comment_sender_enum
```sql
CREATE TYPE comment_sender AS ENUM ('CLIENT', 'ADMIN');
```

## Relationships

### Foreign Keys with CASCADE DELETE

1. **projects.client_id → users.id**
   - When user deleted, all their projects are deleted

2. **support_tickets.client_id → users.id**
   - When user deleted, all their tickets are deleted

3. **ticket_comments.user_id → users.id**
   - When user deleted, all their comments are deleted

4. **ticket_comments.ticket_id → support_tickets.id**
   - When ticket deleted, all comments are deleted

5. **password_resets.user_id → users.id**
   - When user deleted, all reset tokens are deleted

6. **email_verifications.user_id → users.id**
   - When user deleted, all verification tokens are deleted

## Migration History

| Migration | Description | Date |
|-----------|-------------|------|
| `0000_clumsy_frank_castle` | Initial schema creation | Initial |
| `0001_happy_hairball` | Updated FK constraints to CASCADE | Initial |
| `0002_wooden_falcon` | Added ticket_number to support_tickets | Initial |
| `0003_tiny_tony_stark` | Added active column to users | Initial |
| `0004_left_the_anarchist` | Added SUPER_ADMIN role | Initial |

## Performance Recommendations

### Critical Missing Indexes
```sql
-- High Priority (Foreign Keys)
CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_support_tickets_client_id ON support_tickets(client_id);
CREATE INDEX idx_ticket_comments_ticket_id ON ticket_comments(ticket_id);
CREATE INDEX idx_ticket_comments_user_id ON ticket_comments(user_id);
CREATE INDEX idx_password_resets_user_id ON password_resets(user_id);
CREATE INDEX idx_email_verifications_user_id ON email_verifications(user_id);

-- Medium Priority (Lookup Fields)
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(active);

-- Low Priority (Composite Indexes)
CREATE INDEX idx_projects_client_status ON projects(client_id, status);
CREATE INDEX idx_tickets_client_status ON support_tickets(client_id, status);
```

### Cleanup Procedures Needed
```sql
-- Automated cleanup for expired tokens
DELETE FROM password_resets 
WHERE expires_at < NOW() AND used = false;

DELETE FROM email_verifications 
WHERE expires_at < NOW() AND used = false;
```

## Security Considerations

### Data Protection
- **Password Storage**: Uses bcrypt hashing (implemented in application)
- **Token Security**: Reset/verification tokens should be hashed
- **Email Validation**: No database-level email format validation
- **Soft Deletes**: Consider implementing soft deletes for audit trails

### Access Patterns
- All sensitive operations should check user roles
- Session validation required for all authenticated endpoints
- Email verification required before account activation

## Common Queries

### User Management
```sql
-- Get all active clients
SELECT * FROM users WHERE role = 'CLIENT' AND active = true;

-- Get user with projects
SELECT u.*, p.* FROM users u 
LEFT JOIN projects p ON u.id = p.client_id 
WHERE u.id = $1;
```

### Project Management
```sql
-- Get projects by status for client
SELECT * FROM projects 
WHERE client_id = $1 AND status = $2 
ORDER BY updated_at DESC;

-- Get project with client info
SELECT p.*, u.name, u.email, u.company 
FROM projects p 
JOIN users u ON p.client_id = u.id 
WHERE p.id = $1;
```

### Support System
```sql
-- Get tickets with comment count
SELECT t.*, COUNT(c.id) as comment_count 
FROM support_tickets t 
LEFT JOIN ticket_comments c ON t.id = c.ticket_id 
GROUP BY t.id 
ORDER BY t.updated_at DESC;

-- Get ticket conversation
SELECT c.*, u.name, u.role 
FROM ticket_comments c 
JOIN users u ON c.user_id = u.id 
WHERE c.ticket_id = $1 
ORDER BY c.created_at ASC;
```

## Drizzle ORM Usage

### Schema Location
- **File**: `server/db/schema.ts`
- **Access**: Use `useDrizzle()` composable in server routes
- **Migrations**: Stored in `server/db/migrations/`

### Example Queries
```typescript
// Get user with projects
const userWithProjects = await db.query.users.findFirst({
  where: eq(users.id, userId),
  with: {
    projects: true,
    supportTickets: true
  }
});

// Create new project
const project = await db.insert(projects).values({
  id: generateId(),
  title: 'New Project',
  client_id: userId,
  type: 'WEBSITE',
  status: 'PENDING'
}).returning();
```
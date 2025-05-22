# Development Setup Guide

> Last updated: January 2025  
> Environment: Node.js, PostgreSQL, Nuxt 3

## Prerequisites

### Required Software
- **Node.js**: v18.0.0 or higher
- **npm**: v8.0.0 or higher (comes with Node.js)
- **Git**: Latest version
- **PostgreSQL**: v14+ (or Supabase account)
- **Code Editor**: VS Code recommended

### Recommended VS Code Extensions
```json
{
  "recommendations": [
    "vue.volar",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-json",
    "formulahendry.auto-rename-tag"
  ]
}
```

## Quick Start

### 1. Clone Repository
```bash
git clone <repository-url>
cd kaygia-web
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create `.env` file in project root:
```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/kaygia_web"
DIRECT_URL="postgresql://username:password@localhost:5432/kaygia_web"

# Session Security (generate a random 32-character string)
NUXT_SESSION_PASSWORD="your-32-character-session-password-here"

# Email Configuration (Resend)
RESEND_API_KEY="re_your_resend_api_key_here"
FROM_EMAIL="noreply@yourdomain.com"

# Application URL
NUXT_PUBLIC_SITE_URL="http://localhost:3000"
```

### 4. Database Setup

#### Option A: Local PostgreSQL
```bash
# Create database
createdb kaygia_web

# Run migrations
npm run db:migrate
```

#### Option B: Supabase (Recommended)
1. Create project at [supabase.com](https://supabase.com)
2. Get connection strings from Settings → Database
3. Update `DATABASE_URL` and `DIRECT_URL` in `.env`
4. Run migrations:
   ```bash
   npm run db:migrate
   ```

### 5. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Detailed Setup

### Database Configuration

#### Local PostgreSQL Setup
```bash
# Install PostgreSQL (macOS with Homebrew)
brew install postgresql@14
brew services start postgresql@14

# Create database and user
psql postgres
CREATE DATABASE kaygia_web;
CREATE USER kaygia_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE kaygia_web TO kaygia_user;
\q
```

#### Environment Variables Explained
```env
# Database URLs
DATABASE_URL="postgresql://username:password@host:port/database"
DIRECT_URL="postgresql://username:password@host:port/database"
# DIRECT_URL is used for migrations, can be the same as DATABASE_URL

# Session encryption (required for auth)
NUXT_SESSION_PASSWORD="min-32-character-string-for-session-encryption"

# Email service (sign up at resend.com)
RESEND_API_KEY="re_xxxxxxxxxxxxx"
FROM_EMAIL="noreply@yourdomain.com"

# Application URL (for email links)
NUXT_PUBLIC_SITE_URL="http://localhost:3000"
```

### Email Service Setup (Resend)

1. **Sign up** at [resend.com](https://resend.com)
2. **Verify domain** or use their test domain
3. **Create API key** in dashboard
4. **Add to environment**:
   ```env
   RESEND_API_KEY="re_your_api_key"
   FROM_EMAIL="noreply@your-verified-domain.com"
   ```

### Development Database Commands

```bash
# Generate new migration
npm run db:generate

# Apply migrations
npm run db:migrate

# Push schema changes (development only)
npm run db:push

# Open database studio
npm run db:studio
```

## Project Structure Understanding

### Layer Architecture
```
layers/
├── core/           # Base configuration and types
├── marketing/      # Public website pages
├── dashboard/      # Client portal
├── auth/          # Authentication system
└── admin/         # Admin panel
```

### Key Directories
```
├── components/ui/     # shadcn-vue UI components
├── server/db/         # Database schema and migrations
├── docs/              # Project documentation
├── types/             # Global TypeScript types
└── utils/             # Shared utilities
```

## Common Development Tasks

### Creating New Features

#### 1. Add New Page
```bash
# Marketing page
touch layers/marketing/pages/new-page.vue

# Dashboard page  
touch layers/dashboard/pages/dashboard/new-feature.vue

# Admin page
touch layers/admin/pages/admin/new-admin-page.vue
```

#### 2. Add API Endpoint
```bash
# Dashboard API
touch layers/dashboard/server/api/new-endpoint.get.ts

# Admin API
touch layers/admin/server/api/admin/new-admin-endpoint.post.ts
```

#### 3. Create Component
```bash
# UI component
touch components/ui/new-component/NewComponent.vue

# Layer-specific component
touch layers/dashboard/components/NewFeatureComponent.vue
```

### Database Operations

#### Add New Table
1. **Update schema**:
   ```typescript
   // server/db/schema.ts
   export const newTable = pgTable('new_table', {
     id: text('id').primaryKey(),
     name: text('name').notNull(),
     createdAt: timestamp('created_at').defaultNow().notNull()
   });
   ```

2. **Generate migration**:
   ```bash
   npm run db:generate
   ```

3. **Apply migration**:
   ```bash
   npm run db:migrate
   ```

#### Modify Existing Table
1. **Update schema** in `server/db/schema.ts`
2. **Generate migration**: `npm run db:generate`
3. **Review migration** in `server/db/migrations/`
4. **Apply migration**: `npm run db:migrate`

### Authentication Integration

#### Protect New Routes
```typescript
// layers/dashboard/middleware/custom-auth.ts
export default defineNuxtRouteMiddleware((to) => {
  const { user } = useUserState();
  
  if (!user.value) {
    return navigateTo('/auth/login');
  }
});
```

#### Access User Session in API
```typescript
// layers/dashboard/server/api/protected-endpoint.get.ts
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

### UI Component Development

#### Using shadcn-vue Components
```vue
<script setup lang="ts">
// Components are auto-imported, no need to import
// import { Button } from '@/components/ui/button' // ❌ Don't do this

// Icons need explicit import
import { User, Settings } from 'lucide-vue-next'
</script>

<template>
  <div>
    <Button variant="default">
      <User class="w-4 h-4 mr-2" />
      User Button
    </Button>
  </div>
</template>
```

#### Creating Custom Components
```vue
<!-- components/ui/custom-card/CustomCard.vue -->
<script setup lang="ts">
interface Props {
  title: string
  description?: string
}

const props = defineProps<Props>()
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>{{ title }}</CardTitle>
      <CardDescription v-if="description">
        {{ description }}
      </CardDescription>
    </CardHeader>
    <CardContent>
      <slot />
    </CardContent>
  </Card>
</template>
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Errors
```bash
# Check if PostgreSQL is running
brew services list | grep postgresql

# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Check migration status
npm run db:studio
```

#### 2. Session/Auth Issues
```bash
# Clear browser cookies
# Check NUXT_SESSION_PASSWORD is set
# Verify session cookie settings
```

#### 3. Email Not Sending
```bash
# Verify Resend API key
# Check domain verification
# Test email in Resend dashboard
```

#### 4. Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Nuxt cache
rm -rf .nuxt
npm run dev
```

### Development Tools

#### Database Management
```bash
# View database with Drizzle Studio
npm run db:studio

# Direct PostgreSQL access
psql $DATABASE_URL
```

#### Debugging
```typescript
// Use console.log in server routes
console.log('Debug:', data);

// Use Vue DevTools in browser
// Install browser extension
```

### Code Quality

#### Linting and Formatting
```bash
# If linting is set up
npm run lint
npm run lint:fix

# Format code
npm run format
```

#### Type Checking
```bash
# TypeScript check
npx vue-tsc --noEmit

# Nuxt type generation
npm run postinstall
```

## Environment-Specific Setup

### Development Environment
- Use local database or Supabase free tier
- Enable detailed error messages
- Use test email domain

### Staging Environment
- Use staging database
- Test email sending
- Verify all features work

### Production Environment
- Use production database with backups
- Configure proper email domain
- Set up monitoring and logging
- Use environment-specific secrets

## Next Steps

After setup completion:

1. **Review Documentation**:
   - [Feature Implementation Status](../features/implementation-status.md)
   - [API Documentation](../api/README.md)
   - [Layer Architecture](../architecture/layers.md)

2. **Explore the Application**:
   - Register a new account
   - Create a project
   - Submit a support ticket
   - Access admin panel (create admin user)

3. **Start Development**:
   - Choose a feature from the implementation status
   - Follow the layer architecture patterns
   - Use the established coding conventions

4. **Join Development**:
   - Create feature branches
   - Follow commit conventions
   - Submit pull requests for review
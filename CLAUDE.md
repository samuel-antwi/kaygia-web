# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Core Development
npm run dev           # Start development server
npm run build         # Production build
npm run preview       # Preview production build

# Database Management
npm run db:generate   # Generate new Drizzle migrations
npm run db:migrate    # Apply pending migrations
npm run db:push       # Push schema changes without migrations
npm run db:studio     # Open Drizzle Studio (database UI)
```

## Architecture Overview

### Layer-Based Architecture
This Nuxt 3 project uses **Nuxt Layers** for modular architecture with 5 distinct layers:

```typescript
extends: [
  "./layers/core",      // Shared utilities, types, layouts, plugins
  "./layers/marketing", // Public website (/, /services, /about, /contact)
  "./layers/dashboard", // Client portal (/dashboard/*)
  "./layers/auth",      // Authentication system (/auth/*)
  "./layers/admin",     // Admin management (/admin/*)
]
```

Each layer is self-contained with its own pages, components, server routes, and nuxt.config.ts.

### Database Architecture
- **ORM**: Drizzle ORM with PostgreSQL (Supabase)
- **Schema**: Located in `server/db/schema.ts`
- **Key entities**: users, projects, supportTickets, ticketComments, passwordResets, emailVerifications
- **Access**: Use `useDrizzle()` composable in server routes

### Authentication Flow
- **Session-based**: Uses `nuxt-auth-utils` with 7-day cookie sessions
- **Email verification**: Required for new accounts
- **Password reset**: Token-based with time expiration
- **Roles**: CLIENT, ADMIN, SUPER_ADMIN with middleware protection
- **Access sessions**: `const session = await getUserSession(event)` in API routes

## Development Guidelines

### Component Organization
- **Naming**: PascalCase for components (`ProjectCard.vue`), kebab-case for pages
- **Imports**: 
  - Never import Nuxt auto-imports (composables, utils)
  - Never import shadcn-vue components (auto-imported)
  - **Always import Lucide icons explicitly**: `import { Menu, User } from "lucide-vue-next"`
- **Structure**: Keep components under 300 lines, break into smaller modules
- **Currency**: Use pounds (£) not dollars ($) - UK-based project

### Code Patterns
```vue
<script setup lang="ts">
// 1. Type imports
import type { Project } from '~/types'
// 2. Explicit icon imports  
import { Settings, User } from "lucide-vue-next"
// 3. Props with types
interface Props {
  project: Project
}
const props = defineProps<Props>()
// 4. Composables (auto-imported)
const { user } = useAuth()
</script>
```

### API Development
- **Routes**: Use kebab-case (`/api/project-status`)
- **Validation**: Always validate with Zod schemas
- **Database**: Only use Drizzle ORM, no direct SQL
- **Session access**: `const session = await getUserSession(event)`

### Layer-Specific Features
- **Marketing**: SEO-optimized public pages with contact forms
- **Dashboard**: Project management, settings, ticket system for clients
- **Auth**: Complete flow with registration, login, email verification, password reset
- **Admin**: User management, project oversight, ticket administration
- **Core**: Shared utilities, layouts, and base configurations

### State Management
- **User state**: Use `useUserState()` composable for user data
- **Project state**: Use store in `layers/dashboard/stores/projectStore.ts`
- **Ticket state**: Use store in `layers/dashboard/stores/ticketStore.ts`

### Common Import Patterns
```typescript
// These are auto-imported by Nuxt - don't import manually
useRoute(), useRouter(), useHead(), useFetch()

// Always import explicitly
import { Menu } from "lucide-vue-next"
import { toast } from "~/components/ui/toast/use-toast"

// Session access in API routes
const session = await getUserSession(event)
```

### Security Considerations
- All `/dashboard/*` routes protected by auth middleware
- All `/admin/*` routes protected by admin-only middleware  
- Role validation enforced in API endpoints
- Password hashing with bcrypt
- Email verification required for account activation
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
- **IMPORTANT**: Never import `getUserSession` in API endpoints - it's automatically available globally in Nuxt server context

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

// Session access in API routes (NEVER import getUserSession)
const session = await getUserSession(event) // ✅ Just use it directly
// import { getUserSession } from "#auth" // ❌ NEVER do this
```

### Security Considerations
- All `/dashboard/*` routes protected by auth middleware
- All `/admin/*` routes protected by admin-only middleware  
- Role validation enforced in API endpoints
- Password hashing with bcrypt
- Email verification required for account activation

## 🚨 CRITICAL RULE: PACKAGE MANAGEMENT

### ⛔ **NEVER REMOVE PACKAGES WITHOUT PERMISSION**

**ABSOLUTE RULE**: Never remove or modify existing packages in `package.json` without explicit user confirmation.

#### **Why this matters:**
- **bcrypt/bcryptjs** - Removing breaks authentication system
- **resend** - Removing breaks email verification and password resets  
- **drizzle-orm** - Removing breaks database access
- **nuxt-auth-utils** - Removing breaks login functionality
- **Core dependencies** - Can break entire application

#### **Safe approach:**
1. **Always READ** existing package.json first
2. **Only ADD** new packages when needed
3. **Never OVERWRITE** the entire file
4. **ASK permission** before removing anything
5. **Use `npm install package-name`** instead of rewriting file

#### **Example of correct behavior:**
```bash
# ✅ CORRECT: Adding a new package
npm install new-package

# ❌ WRONG: Overwriting package.json
# Don't manually rewrite the entire file
```

### **Emergency Recovery:**
If packages are accidentally removed:
1. Check `git show HEAD:package.json` for original
2. Restore all missing packages immediately
3. Run `npm install` to reinstall
4. Test that authentication/email still works
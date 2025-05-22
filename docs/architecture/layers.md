# Layer Architecture Documentation

> Last updated: January 2025  
> Framework: Nuxt 3 with Layer Architecture  
> Location: `/layers/`

## Overview

Kaygia Web uses **Nuxt Layers** to create a modular, scalable architecture. Each layer serves a specific domain with isolated concerns, shared dependencies, and clear boundaries.

## Layer Hierarchy

```typescript
// nuxt.config.ts
extends: [
  "./layers/core",      // Foundation layer
  "./layers/marketing", // Public website  
  "./layers/dashboard", // Client portal
  "./layers/auth",      // Authentication
  "./layers/admin",     // Administration
]
```

### Extension Order
1. **Core** → Base configuration and utilities
2. **Marketing** → Public pages and SEO
3. **Dashboard** → Client functionality  
4. **Auth** → Authentication system
5. **Admin** → Administrative features

Each layer can access and override features from previous layers.

## Layer Details

### 1. Core Layer (`/layers/core/`)

**Purpose**: Foundation layer providing shared utilities, types, and base configuration.

**Structure**:
```
core/
├── nuxt.config.ts          # Base Nuxt configuration
├── layouts/default.vue     # Default layout
├── types/user.ts          # Shared user types
├── utils/index.ts         # Shared utilities
└── components/            # Base components (empty)
```

**Configuration**:
```typescript
// layers/core/nuxt.config.ts
export default defineNuxtConfig({
  css: ['~/assets/css/tailwind.css'],
  modules: ['@nuxtjs/tailwindcss']
});
```

**Responsibilities**:
- Base Tailwind CSS setup
- Shared TypeScript types
- Common utilities and helpers
- Default layout structure
- Core dependencies

**Used By**: All other layers

---

### 2. Marketing Layer (`/layers/marketing/`)

**Purpose**: Public-facing website for the web agency.

**Structure**:
```
marketing/
├── nuxt.config.ts          # Marketing-specific config
├── pages/
│   ├── index.vue           # Homepage
│   ├── services.vue        # Services page
│   ├── about.vue           # About page
│   └── contact.vue         # Contact page
├── components/             # Marketing components
├── composables/            # Marketing composables
└── types/                  # Marketing types
```

**Configuration**:
```typescript
// layers/marketing/nuxt.config.ts
export default defineNuxtConfig({
  // Marketing-specific modules, SEO, etc.
});
```

**Pages & Routes**:
- `/` - Homepage with agency overview
- `/services` - Web development services
- `/about` - Company information
- `/contact` - Contact form and information

**Features**:
- SEO-optimized pages
- Responsive design
- Contact form integration
- Service showcases
- Company portfolio

**Target Audience**: Potential clients, general public

**Dependencies**: Core layer

---

### 3. Dashboard Layer (`/layers/dashboard/`)

**Purpose**: Client portal for project management and communication.

**Structure**:
```
dashboard/
├── nuxt.config.ts          # Dashboard configuration
├── pages/dashboard/
│   ├── index.vue           # Dashboard overview
│   ├── projects/
│   │   ├── index.vue       # Project list
│   │   ├── [id].vue        # Project details
│   │   └── new.vue         # Create project
│   ├── tickets/
│   │   ├── index.vue       # Ticket list
│   │   └── [id].vue        # Ticket details
│   └── settings.vue        # User settings
├── components/
│   └── PasswordChangeForm.vue
├── composables/
│   └── useTicketUtils.ts
├── server/api/             # Dashboard API endpoints
├── stores/                 # Client-side state
└── types/                  # Dashboard types
```

**API Endpoints**:
```
/api/projects/              # Project management
/api/tickets/               # Support tickets
/api/profile/               # User profile
/api/messages/              # Communication
```

**Features**:
- Project viewing and management
- Support ticket system
- Profile settings
- Password change functionality
- Project status tracking

**State Management**:
- `stores/projectStore.ts` - Project state
- `stores/ticketStore.ts` - Ticket state

**Target Audience**: Authenticated clients

**Dependencies**: Core, Auth layers

---

### 4. Auth Layer (`/layers/auth/`)

**Purpose**: Complete authentication system with security features.

**Structure**:
```
auth/
├── nuxt.config.ts          # Auth configuration
├── pages/auth/
│   ├── login.vue           # Login page
│   ├── register.vue        # Registration
│   ├── forgot-password.vue # Password reset request
│   ├── check-email.vue     # Email check confirmation
│   └── reset-password/[token].vue
├── pages/
│   ├── resend-verification.vue
│   └── verify-email/[token].vue
├── middleware/auth.ts      # Auth middleware
├── composables/useAuth.ts  # Auth composable
├── server/api/auth/        # Auth API endpoints
└── types/                  # Auth types
```

**Configuration**:
```typescript
// layers/auth/nuxt.config.ts
export default defineNuxtConfig({
  modules: ['nuxt-auth-utils']
});
```

**API Endpoints**:
```
/api/auth/login             # User login
/api/auth/register          # User registration
/api/auth/logout            # Session termination
/api/auth/reset-password    # Password reset request
/api/auth/complete-reset    # Complete password reset
/api/auth/verify-email      # Email verification
/api/auth/resend-verification # Resend verification
/api/user/profile           # User profile data
```

**Security Features**:
- Session-based authentication (7-day cookies)
- Password hashing with bcrypt
- Email verification required
- Secure password reset flow
- Role-based access control
- Account activation/deactivation

**Middleware**:
- `auth.ts` - Protects `/dashboard/*` routes

**Target Audience**: All users (registration/login)

**Dependencies**: Core layer

---

### 5. Admin Layer (`/layers/admin/`)

**Purpose**: Administrative interface for managing users, projects, and support.

**Structure**:
```
admin/
├── nuxt.config.ts          # Admin configuration
├── pages/admin/
│   ├── index.vue           # Admin dashboard
│   ├── users/
│   │   ├── index.vue       # User management
│   │   ├── [id].vue        # User details
│   │   └── create.vue      # Create user
│   ├── projects/
│   │   ├── index.vue       # Project management
│   │   └── [id].vue        # Project details
│   └── tickets/
│       ├── index.vue       # Ticket management
│       └── [id].vue        # Ticket details
├── components/users/       # Admin user components
├── middleware/admin-only.global.ts
├── server/api/admin/       # Admin API endpoints
├── composables/            # Admin utilities
└── utils/adminAccess.ts    # Access control
```

**API Endpoints**:
```
/api/admin/dashboard/       # Dashboard stats
/api/admin/users/           # User management
/api/admin/projects/        # Project management
/api/admin/tickets/         # Ticket management
```

**Features**:
- User management (create, edit, roles, status)
- Project oversight and management
- Support ticket administration
- System statistics and analytics
- Email verification management
- Password reset functionality
- Activity monitoring

**Components**:
- `UserProfile.vue` - User profile display
- `UserCreationForm.vue` - Create new users
- `RoleManagement.vue` - Role assignment
- `AccountStatusManagement.vue` - Account activation
- `EmailVerificationManagement.vue` - Email verification
- `PasswordManagement.vue` - Password operations

**Security**:
- `admin-only.global.ts` - Restricts `/admin/*` to ADMIN+ roles
- Role validation in all admin endpoints
- Audit trail for sensitive operations

**Target Audience**: ADMIN and SUPER_ADMIN users

**Dependencies**: Core, Auth layers

## Layer Communication

### Data Flow
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Client    │    │    Admin    │    │   Server    │
│  (Browser)  │◄──►│   Panel     │◄──►│     API     │
└─────────────┘    └─────────────┘    └─────────────┘
       │                  │                  │
       └──────────────────┼──────────────────┘
                          │
                   ┌─────────────┐
                   │  Database   │
                   │ (PostgreSQL)│
                   └─────────────┘
```

### Layer Dependencies
```
Admin Layer    ──┐
Dashboard Layer ─┼──► Auth Layer ──► Core Layer
Marketing Layer ─┘
```

### Shared Resources

**From Core Layer**:
- Base types (`types/user.ts`)
- Utilities (`utils/index.ts`)
- Default layout
- Tailwind configuration

**From Auth Layer**:
- Session management
- User authentication
- Role-based access
- Auth composables

**Cross-Layer Communication**:
- API endpoints can be called from any layer
- Composables are layer-scoped but can import from dependencies
- Components can extend/override from parent layers

## Configuration Inheritance

### Layer Configuration Merging
```typescript
// Final configuration combines all layers
const finalConfig = {
  ...coreConfig,
  ...marketingConfig,
  ...dashboardConfig,
  ...authConfig,
  ...adminConfig
};
```

### Module Loading
Each layer can add Nuxt modules:
```typescript
// layers/auth/nuxt.config.ts
modules: ['nuxt-auth-utils']

// layers/admin/nuxt.config.ts  
modules: ['@pinia/nuxt']
```

## Routing Strategy

### Route Organization by Layer

**Marketing Routes** (`/`):
- `/` - Homepage
- `/services` - Services
- `/about` - About
- `/contact` - Contact

**Auth Routes** (`/auth/*`):
- `/auth/login`
- `/auth/register`
- `/auth/forgot-password`
- `/verify-email/[token]`

**Dashboard Routes** (`/dashboard/*`):
- `/dashboard`
- `/dashboard/projects`
- `/dashboard/tickets`
- `/dashboard/settings`

**Admin Routes** (`/admin/*`):
- `/admin`
- `/admin/users`
- `/admin/projects`
- `/admin/tickets`

### Route Protection

**Middleware Stack**:
1. `auth.ts` - Protects `/dashboard/*`
2. `admin-only.global.ts` - Protects `/admin/*`

**Permission Levels**:
- **Public**: Marketing pages
- **Authenticated**: Dashboard pages
- **Admin**: Admin pages

## Development Workflow

### Adding Features

**To Marketing Layer**:
1. Add pages to `layers/marketing/pages/`
2. Create components in `layers/marketing/components/`
3. Update SEO metadata

**To Dashboard Layer**:
1. Add pages to `layers/dashboard/pages/dashboard/`
2. Create API endpoints in `layers/dashboard/server/api/`
3. Add types to `layers/dashboard/types/`
4. Update stores if needed

**To Admin Layer**:
1. Add pages to `layers/admin/pages/admin/`
2. Create admin API endpoints in `layers/admin/server/api/admin/`
3. Add admin components to `layers/admin/components/`
4. Ensure proper role validation

### Layer Isolation Rules

**Do**:
- Keep layer-specific logic within the layer
- Use shared types from Core layer
- Import composables from dependency layers
- Override configurations as needed

**Don't**:
- Import from higher-level layers
- Mix business logic between layers
- Create circular dependencies
- Share state between unrelated layers

## Performance Considerations

### Layer Loading
- Each layer adds to bundle size
- Components are auto-imported across layers
- API routes are bundled by layer

### Optimization Strategies
- Code splitting by layer
- Lazy loading of admin components
- Selective module inclusion
- Tree shaking of unused exports

## Future Enhancements

### Planned Layer Extensions
1. **API Layer** - Standalone API documentation
2. **Mobile Layer** - Mobile-specific optimizations
3. **Analytics Layer** - Business intelligence
4. **Integration Layer** - Third-party services

### Scalability Considerations
- Layer-based feature toggles
- Environment-specific layer inclusion
- Multi-tenant layer architecture
- Plugin-based layer system
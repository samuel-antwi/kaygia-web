# 🧱 Project Overview: Web Development Agency Platform (Nuxt 3 + Nuxt Layers)

You're helping build a scalable, modern web app for a **local web development agency**.

The app has two main goals:

1. Serve as a **marketing website** for small businesses/startups
2. Provide a **client portal** for project booking and tracking

---

## ⚙️ Tech Stack

| Layer        | Tech                                                     |
| ------------ | -------------------------------------------------------- |
| Framework    | Nuxt 3 (Vue 3 + TypeScript + `<script setup lang="ts">`) |
| Styling      | Tailwind CSS                                             |
| UI Library   | `shadcn-vue`                                             |
| Icons        | `lucide-vue-nex`                                         |
| Composables  | `vueuse`                                                 |
| Auth         | Supabase Auth                                            |
| ORM          | Prisma ORM                                               |
| Database     | Supabase PostgreSQL                                      |
| API          | Nuxt Server Routes (`/server/api`)                       |
| Hosting      | Vercel, Netlify, or Supabase                             |
| Architecture | **Nuxt Layers** for modular structure                    |

---

## 🧩 Nuxt Layers Structure

We'll structure the project into **three distinct layers**:

. ├── layers/ │ ├── core/ # Shared composables, plugins, Prisma, configs │ ├── marketing/ # Public website (homepage, services, about) │ └── app/ # Client-side app (auth, dashboard, requests)

markdown
Copy
Edit

### 🔸 `core/`

- Shared Tailwind config
- Prisma setup
- Nuxt plugins (e.g. Supabase client)
- Shared composables (`useAuth`, `useProjects`)
- Constants, utils, types

### 🔸 `marketing/`

- Pages: `/`, `/services`, `/about`, `/portfolio`, `/contact`
- SEO meta for each page
- Simple forms (e.g. contact)
- Responsive design using `shadcn-vue`

### 🔸 `app/`

- Auth (login, register)
- Dashboard: `/dashboard` (project listing, statuses)
- Project request page (`/request-project`)
- Auth middleware
- Role-based access (later)

---

## 🗂️ Features & Pages

### 🔹 Public Marketing Website

- Homepage, Services, Portfolio, About Us, Contact Form
- Contact messages saved to Supabase (`contact_messages`)

### 🔹 Project Booking

- Form with project details
- Saved in Supabase via Prisma
- Optional: Email notifications later

### 🔹 Auth

- Supabase Auth for sign-up / login
- Session management with Supabase Auth
- Use middleware to protect `/dashboard` routes

### 🔹 Client Dashboard

- View submitted project requests
- Track project status (pending → in progress → complete)
- Messaging (future)

---

## 📋 Development Standards & Conventions

### Component Structure

```vue
<script setup lang="ts">
// Types first
type Props = {
  title: string;
};

// Props and emits
const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "update"): void;
}>();

// Composables
const { someComposable } = useSomeComposable();

// Component logic
</script>

<template>
  <div>
    <!-- Template content -->
  </div>
</template>

<style scoped>
/* Component styles */
</style>
```

### Naming Conventions

- Components: PascalCase (e.g., `ProjectCard.vue`)
- Composables: camelCase with 'use' prefix (e.g., `useAuth.ts`)
- Types/Interfaces: PascalCase (e.g., `ProjectStatus.ts`)
- API routes: kebab-case (e.g., `/api/project-status`)

## 🔧 Environment & Configuration

Required environment variables:

```env
DATABASE_URL=
SUPABASE_URL=
SUPABASE_KEY=
```

## 🧪 Testing Strategy

- **Unit Tests**: Vitest for testing composables and utilities
- **Component Tests**: Vue Test Utils for component logic
- **E2E Tests**: Playwright for critical user journeys
- **API Tests**: Supertest for API endpoint testing

## 🚀 Deployment & CI/CD

### Development Workflow

1. Feature branches from `main`
2. PR review required
3. Automated tests must pass
4. Deploy to staging for review
5. Merge to main triggers production deployment

### Environments

- Development: Local
- Staging: Preview deployments
- Production: Main branch deployments

## 🔒 Security Considerations

- **Authentication**: Supabase Auth
- **API Security**:
  - Rate limiting on all endpoints
  - CORS configuration
  - Request validation
  - XSS protection
  - CSRF tokens

## ⚡ Performance Optimization

### Image Optimization

- Use Nuxt Image module
- WebP format with fallbacks
- Lazy loading for below-fold images

### SEO Strategy

- Meta tags management
- Sitemap generation
- Structured data implementation
- Performance monitoring

### Caching Strategy

- SSR with ISR where applicable
- API response caching
- Static asset caching
- Database query caching

---

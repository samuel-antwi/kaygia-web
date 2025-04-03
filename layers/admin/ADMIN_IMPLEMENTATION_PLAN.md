# Admin Layer Implementation Plan

This document outlines the plan for implementing the Admin UI layer within the Kaygia Web application. This layer will provide administrators with the necessary tools to manage various aspects of the platform, including users, projects, support tickets, and potentially system settings.

## I. Core Objectives

1.  Provide a secure, role-protected interface for administrative tasks.
2.  Enable management of key application entities (Users, Projects, Tickets).
3.  Establish a scalable foundation for future admin features.

## II. Overall Structure (Admin Layer)

The Admin UI will reside within its own Nuxt layer (`layers/admin`) to ensure modularity and separation from client-facing features.

Key sections planned:

1.  **Admin Dashboard:** Overview/summary page (e.g., recent tickets, pending projects).
2.  **User Management:** List, view, potentially edit user details and roles.
3.  **Project Management:** List, view, potentially edit project details and statuses.
4.  **Ticket Management:** List, view, comment on, and manage the status of support tickets.
5.  **Settings:** (Potential future) Application-level settings.

## III. Implementation Steps

### Phase 1: Setup & Role-Based Access Control (RBAC)

1.  **Schema Update:**
    - Add `ADMIN` role to the `Role` enum in `prisma/schema.prisma`.
    - **Status:** Pending.
2.  **Database Migration:**
    - Run `npx prisma migrate dev --name add-admin-role` to apply schema changes.
    - **Status:** Pending.
3.  **Assign Admin Role:**
    - Manually update the database to assign the `ADMIN` role to designated user(s).
    - **Status:** Pending.
4.  **Create Admin Layer:**
    - The `layers/admin` directory will be created implicitly when adding files like this plan or initial pages/middleware.
    - **Status:** Pending (will be created with file).
5.  **Admin Middleware:**
    - Create `layers/admin/middleware/admin-only.global.ts` (or similar).
    - This middleware will check `event.context.userSession` or use `getUserSession(event)` and verify the user's role is `ADMIN`.
    - It will protect all routes defined within the `admin` layer's `pages` directory.
    - **Status:** Pending.
6.  **Admin Layout:**
    - Create a basic `layers/admin/layouts/default.vue` (or `admin.vue`) that might differ slightly from the main dashboard layout (e.g., different nav items).
    - **Status:** Pending.
7.  **Basic Admin Page:**
    - Create `layers/admin/pages/index.vue` as a placeholder admin dashboard page, protected by the middleware.
    - **Status:** Pending.

### Phase 2: Ticket Management (Admin Side)

1.  **Admin Ticket API Endpoints:**
    - Create endpoints within `layers/admin/server/api/tickets/` (or similar prefix):
      - `GET /api/admin/tickets`: List _all_ tickets with filtering/pagination.
      - `GET /api/admin/tickets/[ticketId]`: Get specific ticket details (no client ownership check needed for admin).
      - `POST /api/admin/tickets/[ticketId]/comment`: Add comment _as admin_ (setting `sender: ADMIN`).
      - `PUT /api/admin/tickets/[ticketId]/status`: Update ticket status.
    - Ensure all these endpoints _verify admin role_ server-side.
    - **Status:** Pending.
2.  **Admin Ticket Store:**
    - Enhance `useTicketStore` or create a separate `useAdminTicketStore` to handle fetching all tickets and interacting with admin endpoints.
    - **Status:** Pending.
3.  **Admin Ticket UI:**
    - Create `layers/admin/pages/tickets/index.vue` (list view).
    - Create `layers/admin/pages/tickets/[id].vue` (detail view with admin actions like commenting and changing status).
    - **Status:** Pending.

### Phase 3: Project & User Management (Admin Side)

_(Details TBD - Lower priority than tickets for now)_

1.  **API Endpoints:** Create necessary admin endpoints for projects and users.
2.  **Store Logic:** Add state management for admin views of projects/users.
3.  **UI Components:** Build pages/components for listing and managing projects/users.

## IV. Key Considerations

- **Security:** RBAC is critical. All admin pages and API endpoints _must_ be strictly protected.
- **UI/UX:** Keep the admin interface clean, intuitive, and distinct from the client dashboard if necessary.
- **Modularity:** Leverage the layer structure effectively. Share components/composables where appropriate (e.g., potentially some UI elements, utility functions) by placing them in the `core` layer or root `components`/`composables`.

This plan provides a clear path forward, starting with the essential setup and the ticket management features.

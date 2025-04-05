# Admin Layer Progress

This document tracks the implementation progress for the Admin UI layer.

## ✅ Completed Features

**I. Core Setup & Access Control:**

- [x] Created Admin Layer (`layers/admin` directory structure).
- [x] Added `ADMIN` role to `prisma/schema.prisma`.
- [x] Implemented Admin-only Middleware (`layers/admin/middleware/admin-only.global.ts`) to protect admin routes.
- [x] Created dedicated Admin Layout (`layouts/admin.vue`) with:
  - [x] Basic admin navigation sidebar.
  - [x] User information display in sidebar footer.
  - [x] Logout functionality (via dropdown in sidebar footer).
  - [x] Theme (light/dark mode) toggle in header.
  - [x] Mobile sidebar toggle functionality.
  - [x] Desktop sidebar expand/collapse functionality with tooltips.
  - [x] Resolved header icon spacing issues.

**II. Ticket Management (Admin Side):**

- **API Endpoints:**
  - [x] `GET /api/admin/tickets`: List all support tickets (for admins).
  - [x] `GET /api/admin/tickets/[ticketId]`: Get specific ticket details, including client and comments with authors.
  - [x] `POST /api/admin/tickets/[ticketId]/comment`: Allow admin to add a comment to a ticket.
  - [x] `PUT /api/admin/tickets/[ticketId]/status`: Update ticket status.
- **UI Components:**
  - [x] Ticket List Page (`layers/admin/pages/admin/tickets/index.vue`): Displays all tickets in a table, fetches data from API.
  - [x] Ticket Detail Page (`layers/admin/pages/admin/tickets/[id].vue`):
    - [x] Fetches and displays specific ticket details (subject, client info, status, dates).
    - [x] Fetches and displays conversation history (comments from client and admin).
    - [x] Includes a form for admins to add replies/comments.
    - [x] Connects the "Add Reply" form to the `POST .../comment` API endpoint.
    - [x] Refreshes data automatically after a comment is successfully added.
    - [x] Displays API errors if comment submission fails.
    - [x] Implemented frontend logic to call the status update API when the dropdown selection changes.
    - [x] Re-enabled and fixed typing for the status `<Select>` component.
    - [x] Added toast notifications for successful actions (comment added, status changed) and errors.
    - [x] Implemented automatic status changes when admin replies (sets to PENDING when not CLOSED).

**III. User Management (Admin Side):**

- **API Endpoints:**
  - [x] `GET /api/admin/users`: List all users with basic information.
  - [x] `GET /api/admin/users/[userId]`: Get specific user details, including stats on their tickets and projects.
  - [x] `PUT /api/admin/users/[userId]/role`: Update a user's role (promote/demote between ADMIN and CLIENT).
- **UI Components:**
  - [x] User List Page (`layers/admin/pages/admin/users/index.vue`): Displays all users in a table with search functionality.
  - [x] User Detail Page (`layers/admin/pages/admin/users/[id].vue`):
    - [x] Shows user profile information (name, email, role, joined date).
    - [x] Displays statistics about the user's tickets and projects.
    - [x] Allows admin to change the user's role with proper UI feedback.
    - [x] Shows recent tickets and projects for the user.
    - [x] Includes toast notifications for successful role changes and errors.

## ⏳ To Do / Next Steps

- **Project Management:**
  - [ ] Define necessary API endpoints for admin view/management of projects.
  - [ ] Create UI pages/components for project management.
- **Admin Dashboard (`layers/admin/pages/admin/index.vue`):**
  - [ ] Enhance the placeholder dashboard page with useful summaries (e.g., count of open tickets, recent activity).
- **Code Quality:**
  - [ ] Review and remove `console.log` statements added during debugging.
  - [ ] Extract reusable utility functions (like `formatDate`, `getStatusVariant`) into composables if appropriate.

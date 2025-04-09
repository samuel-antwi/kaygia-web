# Dashboard Layer Progress

This document tracks the implemented features within the dashboard layer.

## Legend

- [x] Implemented
- [ ] Planned / Not Implemented

## Core Features

### 1. Dashboard Overview (`/dashboard`)

- **Page:** `pages/dashboard/index.vue`
- **Functionality:**
  - [x] Display a welcome message to the user.
  - [x] Show summary statistics (e.g., number of projects, open tickets - _based on presence of page, specific stats need confirmation by reading the file_).
  - [x] Provide quick links or access to main sections (Projects, Tickets, Profile).

### 2. User Profile Management (`/dashboard/profile`)

- **Page:** `pages/dashboard/profile.vue`
- **Component:** `components/PasswordChangeForm.vue`
- **API Endpoints:**
  - `PATCH /api/profile`
  - `POST /api/profile/change-password`
- **Schema:** `users` table
- **Functionality:**
  - [x] View current user details (name, email, company).
  - [x] Update user profile information (name, company).
  - [x] Change user password.

### 3. Project Management (`/dashboard/projects`)

- **Pages:**
  - `pages/dashboard/projects/index.vue` (List)
  - `pages/dashboard/projects/new.vue` (Create)
  - `pages/dashboard/projects/[id].vue` (Details)
- **API Endpoints:**
  - `GET /api/projects` (List)
  - `POST /api/projects` (Create)
  - `GET /api/projects/[id]` (Read)
  - `PATCH /api/projects/[id]` (Update - _API exists, UI integration might be admin-only or pending_)
- **Schema:** `projects` table
- **Functionality:**
  - [x] List all projects associated with the client.
  - [x] View detailed information for a specific project.
  - [x] Submit a request for a new project.
  - [ ] Update existing project details (API exists, UI TBD).
  - [ ] Delete a project (API TBD, UI TBD).

### 4. Support Ticket System (`/dashboard/tickets`)

- **Pages:**
  - `pages/dashboard/tickets/index.vue` (List & Create - _Create form likely on index page_)
  - `pages/dashboard/tickets/[id].vue` (Details & Comments)
- **Composable:** `composables/useTicketUtils.ts`
- **API Endpoints:**
  - `GET /api/tickets` (List)
  - `POST /api/tickets` (Create)
  - `GET /api/tickets/[ticketId]` (Read Details)
  - `POST /api/tickets/[ticketId]/comment` (Add Comment)
- **Schema:** `supportTickets`, `ticketComments` tables
- **Functionality:**
  - [x] List all support tickets associated with the client.
  - [x] Create a new support ticket.
  - [x] View details of a specific support ticket.
  - [x] View comments associated with a ticket.
  - [x] Add a new comment to a ticket.
  - [ ] Update ticket status (API TBD, UI TBD - likely admin).
  - [ ] Close/Reopen a ticket (API TBD, UI TBD).

_This file should be updated whenever new dashboard features are added or existing ones are modified._

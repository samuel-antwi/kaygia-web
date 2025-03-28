# Kaygia Web

A professional web development agency website built with Nuxt 3. This project includes a marketing site, client dashboard, and secure authentication system.

## Features

- **Marketing Website**: Professional website with services, portfolio, about, and contact pages
- **Client Dashboard**: Secure client area for project management
- **Authentication System**: Complete auth system with login, registration, and password reset
- **Email Integration**: Transactional emails for account actions
- **Responsive Design**: Mobile-first approach using Tailwind CSS
- **Dark/Light Mode**: Theme switching with persistent preferences

## Tech Stack

- [Nuxt 3](https://nuxt.com/) - Vue.js Framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [shadcn-vue](https://github.com/radix-vue/shadcn-vue) - UI component library
- [Prisma](https://www.prisma.io/) - TypeScript ORM
- [Supabase](https://supabase.io/) - PostgreSQL database
- [nuxt-auth-utils](https://github.com/nuxt-modules/auth-utils) - Authentication utilities
- [Resend](https://resend.com/) - Email API

## Documentation

Detailed documentation for different features:

- [Auth System](/docs/auth)
  - [Password Reset Implementation](/docs/auth/password-reset.md)

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

### Environment Variables

Create a `.env` file with the following variables:

```
DATABASE_URL=your-supabase-postgres-connection-string
DIRECT_URL=your-supabase-postgres-direct-connection-string
NUXT_SESSION_PASSWORD=your-secure-random-string
RESEND_API_KEY=your-resend-api-key
FROM_EMAIL=no-reply@your-domain.com
NUXT_PUBLIC_SITE_URL=https://your-domain.com
```

### Database Setup

Initialize the database schema:

```bash
npx prisma migrate dev
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

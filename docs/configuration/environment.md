# Environment Configuration Guide

> Last updated: January 2025  
> Framework: Nuxt 3 with Environment Variables

## Overview

Kaygia Web uses environment variables for configuration across different deployment environments. All sensitive data and environment-specific settings are externalized from the codebase.

## Environment Variables

### Required Variables

#### Database Configuration
```env
# Primary database connection (for application runtime)
DATABASE_URL="postgresql://username:password@host:port/database"

# Direct database connection (for migrations and Drizzle Studio)
DIRECT_URL="postgresql://username:password@host:port/database"
```

**Notes**:
- `DATABASE_URL` and `DIRECT_URL` can be the same for most setups
- `DIRECT_URL` is used by Drizzle Kit for migrations and studio
- Use connection pooling URL for `DATABASE_URL` in production
- Use direct connection URL for `DIRECT_URL`

#### Session Security
```env
# 32+ character random string for session encryption
NUXT_SESSION_PASSWORD="your-32-character-secure-random-string-here"
```

**Generation**:
```bash
# Generate secure session password
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### Email Service
```env
# Resend API key for transactional emails
RESEND_API_KEY="re_your_api_key_from_resend_dashboard"

# Verified sender email address
FROM_EMAIL="noreply@yourdomain.com"
```

#### Application URL
```env
# Public URL of your application (for email links)
NUXT_PUBLIC_SITE_URL="https://yourdomain.com"
```

### Optional Variables

#### Development Settings
```env
# Enable detailed error reporting (development only)
NODE_ENV="development"

# Database logging (development only)
DATABASE_LOGGING="true"

# Debug mode for email (logs instead of sending)
EMAIL_DEBUG="true"
```

#### Production Settings
```env
# Production environment
NODE_ENV="production"

# Error reporting service (if using)
SENTRY_DSN="https://your-sentry-dsn"

# Analytics tracking (if using)
GOOGLE_ANALYTICS_ID="GA-XXXXX-X"
```

## Environment-Specific Configurations

### Development Environment

**File**: `.env` (local development)
```env
# Database - Local PostgreSQL or Supabase free tier
DATABASE_URL="postgresql://postgres:password@localhost:5432/kaygia_web_dev"
DIRECT_URL="postgresql://postgres:password@localhost:5432/kaygia_web_dev"

# Session - Development key (not secure, for testing only)
NUXT_SESSION_PASSWORD="dev-session-password-not-secure-32chars"

# Email - Resend test domain or development API key
RESEND_API_KEY="re_dev_api_key"
FROM_EMAIL="onboarding@resend.dev"

# Application - Local development URL
NUXT_PUBLIC_SITE_URL="http://localhost:3000"

# Development flags
NODE_ENV="development"
EMAIL_DEBUG="true"
```

### Staging Environment

**File**: `.env.staging` or deployment platform variables
```env
# Database - Staging database
DATABASE_URL="postgresql://user:pass@staging-db:5432/kaygia_web_staging"
DIRECT_URL="postgresql://user:pass@staging-db:5432/kaygia_web_staging"

# Session - Secure staging key
NUXT_SESSION_PASSWORD="staging-secure-32-character-session-key"

# Email - Production email service with staging domain
RESEND_API_KEY="re_staging_api_key"
FROM_EMAIL="staging@yourdomain.com"

# Application - Staging URL
NUXT_PUBLIC_SITE_URL="https://staging.yourdomain.com"

# Staging environment
NODE_ENV="production"
```

### Production Environment

**File**: Deployment platform environment variables (never in code)
```env
# Database - Production database with connection pooling
DATABASE_URL="postgresql://prod_user:secure_pass@prod-db:5432/kaygia_web"
DIRECT_URL="postgresql://prod_user:secure_pass@prod-db:5432/kaygia_web"

# Session - Production secure key
NUXT_SESSION_PASSWORD="production-ultra-secure-32-char-key"

# Email - Production email service
RESEND_API_KEY="re_production_api_key"
FROM_EMAIL="noreply@yourdomain.com"

# Application - Production URL
NUXT_PUBLIC_SITE_URL="https://yourdomain.com"

# Production environment
NODE_ENV="production"
```

## Configuration Sources

### Environment Variable Priority
1. **System Environment Variables** (highest priority)
2. **`.env` file** (local development)
3. **Default values** (in code)

### Loading Order
```javascript
// Nuxt automatically loads in this order:
1. .env
2. .env.local (gitignored)
3. .env.[NODE_ENV]
4. .env.[NODE_ENV].local (gitignored)
```

## Security Best Practices

### Environment Variable Security

#### ✅ Do
- Use deployment platform's secret management
- Rotate keys regularly
- Use different keys per environment
- Validate required variables at startup
- Use secure random generators for secrets

#### ❌ Don't
- Commit `.env` files to version control
- Use production keys in development
- Share API keys in plain text
- Use weak or predictable passwords
- Log environment variables

### Secret Management

#### Development
```env
# .env (gitignored)
NUXT_SESSION_PASSWORD="dev-key-not-secure"
RESEND_API_KEY="re_test_key"
```

#### Production Deployment
```bash
# Set via deployment platform
fly secrets set NUXT_SESSION_PASSWORD="secure-production-key"
fly secrets set RESEND_API_KEY="re_production_key"

# Or via environment variables
export NUXT_SESSION_PASSWORD="secure-production-key"
export RESEND_API_KEY="re_production_key"
```

## Validation and Type Safety

### Runtime Validation
```typescript
// server/utils/config.ts
import { z } from 'zod'

const configSchema = z.object({
  DATABASE_URL: z.string().url(),
  NUXT_SESSION_PASSWORD: z.string().min(32),
  RESEND_API_KEY: z.string().startsWith('re_'),
  FROM_EMAIL: z.string().email(),
  NUXT_PUBLIC_SITE_URL: z.string().url()
})

export const config = configSchema.parse(process.env)
```

### Environment Type Definitions
```typescript
// types/env.d.ts
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string
      DIRECT_URL: string
      NUXT_SESSION_PASSWORD: string
      RESEND_API_KEY: string
      FROM_EMAIL: string
      NUXT_PUBLIC_SITE_URL: string
      NODE_ENV: 'development' | 'production' | 'test'
    }
  }
}
```

## Database Configuration

### Connection String Format
```
postgresql://[username]:[password]@[host]:[port]/[database]?[parameters]
```

### Supabase Configuration
```env
# From Supabase Dashboard → Settings → Database
DATABASE_URL="postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres"
```

### Local PostgreSQL Configuration
```env
# Standard local PostgreSQL
DATABASE_URL="postgresql://postgres:password@localhost:5432/kaygia_web"
DIRECT_URL="postgresql://postgres:password@localhost:5432/kaygia_web"

# With custom user
DATABASE_URL="postgresql://kaygia_user:secure_pass@localhost:5432/kaygia_web"
DIRECT_URL="postgresql://kaygia_user:secure_pass@localhost:5432/kaygia_web"
```

## Email Configuration

### Resend Setup
1. **Sign up** at [resend.com](https://resend.com)
2. **Verify domain** or use their test domain
3. **Create API key** in dashboard
4. **Set environment variables**:
   ```env
   RESEND_API_KEY="re_your_api_key"
   FROM_EMAIL="noreply@your-verified-domain.com"
   ```

### Email Templates
The application uses these email types:
- **Welcome/Verification**: New user email verification
- **Password Reset**: Password recovery emails
- **Notifications**: System notifications (future)

### Development Email Testing
```env
# Use Resend's test domain
FROM_EMAIL="onboarding@resend.dev"

# Or enable debug mode (logs emails instead of sending)
EMAIL_DEBUG="true"
```

## Public vs Private Variables

### Public Variables (CLIENT_SIDE)
Variables prefixed with `NUXT_PUBLIC_` are exposed to the client:
```env
NUXT_PUBLIC_SITE_URL="https://yourdomain.com"
NUXT_PUBLIC_GOOGLE_ANALYTICS_ID="GA-XXXXX-X"
```

### Private Variables (SERVER_ONLY)
All other variables are server-only:
```env
DATABASE_URL="postgresql://..."        # Server only
RESEND_API_KEY="re_..."               # Server only
NUXT_SESSION_PASSWORD="..."           # Server only
```

## Deployment Platform Examples

### Vercel
```bash
# Add environment variables via CLI
vercel env add NUXT_SESSION_PASSWORD production
vercel env add RESEND_API_KEY production

# Or via dashboard: vercel.com → Project → Settings → Environment Variables
```

### Netlify
```bash
# Add via Netlify CLI
netlify env:set NUXT_SESSION_PASSWORD "your-secure-key"
netlify env:set RESEND_API_KEY "re_your_key"

# Or via dashboard: app.netlify.com → Site → Environment Variables
```

### Fly.io
```bash
# Set secrets via fly CLI
fly secrets set NUXT_SESSION_PASSWORD="your-secure-key"
fly secrets set RESEND_API_KEY="re_your_key"
fly secrets set DATABASE_URL="postgresql://..."
```

### Railway
```bash
# Set via Railway CLI
railway variables set NUXT_SESSION_PASSWORD="your-secure-key"
railway variables set RESEND_API_KEY="re_your_key"

# Or via dashboard: railway.app → Project → Variables
```

## Environment Testing

### Validation Script
```javascript
// scripts/validate-env.js
const requiredVars = [
  'DATABASE_URL',
  'NUXT_SESSION_PASSWORD',
  'RESEND_API_KEY',
  'FROM_EMAIL',
  'NUXT_PUBLIC_SITE_URL'
]

const missing = requiredVars.filter(varName => !process.env[varName])

if (missing.length > 0) {
  console.error('Missing required environment variables:', missing)
  process.exit(1)
} else {
  console.log('✅ All required environment variables are set')
}
```

### Run Validation
```bash
# Test environment before deployment
node scripts/validate-env.js
```

## Troubleshooting

### Common Issues

#### Database Connection
```bash
# Test database connection
psql $DATABASE_URL -c "SELECT 1"

# Check if variables are loaded
echo $DATABASE_URL
```

#### Session Issues
```bash
# Verify session password length
node -e "console.log(process.env.NUXT_SESSION_PASSWORD?.length)"
# Should be 32+ characters
```

#### Email Problems
```bash
# Test Resend API key
curl -X POST 'https://api.resend.com/emails' \
  -H "Authorization: Bearer $RESEND_API_KEY" \
  -H 'Content-Type: application/json'
```

### Environment-Specific Debugging

#### Development
```typescript
// Add to any server route for debugging
console.log('Environment check:', {
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL ? '✅ Set' : '❌ Missing',
  RESEND_API_KEY: process.env.RESEND_API_KEY ? '✅ Set' : '❌ Missing'
})
```

#### Production
```typescript
// Minimal logging for production
if (!process.env.DATABASE_URL) {
  console.error('CRITICAL: DATABASE_URL not configured')
}
```

## Migration Between Environments

### From Development to Staging
1. **Export non-sensitive variables**:
   ```bash
   echo "NUXT_PUBLIC_SITE_URL=$NUXT_PUBLIC_SITE_URL"
   ```
2. **Generate new secrets** for staging
3. **Update database URL** to staging database
4. **Test email service** with staging domain

### From Staging to Production
1. **Generate production secrets**
2. **Update all URLs** to production domains
3. **Use production database**
4. **Enable production email domain**
5. **Remove debug flags**

This configuration system ensures secure, environment-specific settings while maintaining development flexibility and production security.
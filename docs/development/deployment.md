# Deployment Guide

> Last updated: January 2025  
> Status: Deployment strategy planned but not fully implemented  
> Recommended Platform: Vercel, Netlify, or Railway

## Overview

This guide covers deployment strategies for Kaygia Web, including environment setup, CI/CD pipeline configuration, and platform-specific deployment instructions.

## Deployment Architecture

### Recommended Stack
- **Frontend/Backend**: Single Nuxt 3 application (SSR/SSG)
- **Database**: Supabase PostgreSQL (managed)
- **Email**: Resend service
- **Storage**: Platform-native file storage
- **Monitoring**: Platform-native or Sentry integration

### Environment Strategy
```
Development → Staging → Production
     ↓           ↓         ↓
Local DB → Staging DB → Production DB
Test Email → Test Email → Production Email
```

## Platform Deployment Options

### 1. Vercel (Recommended)

#### Advantages
- Excellent Nuxt 3 support
- Automatic deployments from Git
- Edge functions for API routes
- Built-in analytics and monitoring
- Zero-config SSL

#### Setup
```bash
# Install Vercel CLI
npm i -g vercel

# Login and deploy
vercel login
vercel

# Set environment variables
vercel env add DATABASE_URL production
vercel env add NUXT_SESSION_PASSWORD production
vercel env add RESEND_API_KEY production
```

#### Configuration
```json
// vercel.json
{
  "framework": "nuxtjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "functions": {
    "server/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "env": {
    "NUXT_PUBLIC_SITE_URL": "https://yourdomain.com"
  }
}
```

### 2. Netlify

#### Advantages
- Form handling for contact forms
- Split testing capabilities
- Functions for API routes
- Build plugins ecosystem

#### Setup
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login and deploy
netlify login
netlify deploy

# Set environment variables
netlify env:set DATABASE_URL "your-database-url"
netlify env:set NUXT_SESSION_PASSWORD "your-session-password"
```

#### Configuration
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = ".output/public"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/server/:splat"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
```

### 3. Railway

#### Advantages
- Excellent PostgreSQL integration
- Simple database backups
- Git-based deployments
- Built-in metrics

#### Setup
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway link
railway deploy

# Add database
railway add postgresql
```

#### Configuration
```json
// railway.json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/api/health"
  }
}
```

### 4. Fly.io

#### Advantages
- Global edge deployment
- Built-in PostgreSQL
- Docker-based deployment
- Low latency worldwide

#### Setup
```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Launch app
fly launch

# Set secrets
fly secrets set DATABASE_URL="your-database-url"
fly secrets set NUXT_SESSION_PASSWORD="your-session-password"
```

#### Configuration
```toml
# fly.toml
app = "kaygia-web"
primary_region = "lhr"

[build]
  builder = "heroku/buildpacks:20"

[env]
  NODE_ENV = "production"

[[services]]
  http_checks = []
  internal_port = 3000
  processes = ["app"]
  protocol = "tcp"
  script_checks = []

  [[services.ports]]
    force_https = true
    handlers = ["http"]
    port = 80

  [[services.ports]]
    handlers = ["tls", "http"]
    port = 443

  [services.concurrency]
    hard_limit = 25
    soft_limit = 20
    type = "connections"
```

## Environment Configuration

### Production Environment Variables

#### Required Variables
```env
# Database
DATABASE_URL="postgresql://user:pass@host:5432/database"
DIRECT_URL="postgresql://user:pass@host:5432/database"

# Session Security
NUXT_SESSION_PASSWORD="32-character-production-secure-key"

# Email Service
RESEND_API_KEY="re_production_api_key"
FROM_EMAIL="noreply@yourdomain.com"

# Application
NUXT_PUBLIC_SITE_URL="https://yourdomain.com"
NODE_ENV="production"
```

#### Optional Variables
```env
# Monitoring
SENTRY_DSN="https://your-sentry-dsn"

# Analytics
GOOGLE_ANALYTICS_ID="GA-XXXXX-X"

# Feature Flags
ENABLE_ADVANCED_FEATURES="true"
```

### Staging Environment
```env
# Use staging prefixes
DATABASE_URL="postgresql://staging-connection"
RESEND_API_KEY="re_staging_api_key"
FROM_EMAIL="staging@yourdomain.com"
NUXT_PUBLIC_SITE_URL="https://staging.yourdomain.com"
```

## Database Deployment

### Migration Strategy

#### Initial Deployment
```bash
# 1. Create production database (Supabase)
# 2. Set DATABASE_URL and DIRECT_URL
# 3. Run migrations
npm run db:migrate

# 4. Verify schema
npm run db:studio
```

#### Ongoing Deployments
```bash
# Automated in CI/CD pipeline
npm run db:migrate
npm run build
npm start
```

### Database Backup Strategy
```bash
# Supabase automatic backups (point-in-time recovery)
# Manual backup before major releases
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Restore if needed
psql $DATABASE_URL < backup-20250120.sql
```

## CI/CD Pipeline

### GitHub Actions Workflow

#### Complete Deployment Pipeline
```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main, staging]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run test
      - run: npm run lint
      - run: npm run type-check

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run build
      
      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: build-files
          path: .output/

  deploy-staging:
    if: github.ref == 'refs/heads/staging'
    needs: [test, build]
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Staging
        run: |
          # Deploy to staging environment
          vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
        env:
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

  deploy-production:
    if: github.ref == 'refs/heads/main'
    needs: [test, build]
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      
      - name: Run Database Migrations
        run: |
          npm ci
          npm run db:migrate
        env:
          DIRECT_URL: ${{ secrets.DATABASE_URL }}
      
      - name: Deploy to Production
        run: |
          vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
        env:
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
      
      - name: Health Check
        run: |
          curl -f https://yourdomain.com/api/health || exit 1

  notify:
    needs: [deploy-production]
    runs-on: ubuntu-latest
    if: always()
    steps:
      - name: Notify Deployment Status
        run: |
          # Send notification (Slack, Discord, etc.)
          echo "Deployment completed"
```

#### Database Migration Job
```yaml
# .github/workflows/migrate.yml
name: Database Migration

on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to migrate'
        required: true
        default: 'staging'
        type: choice
        options:
        - staging
        - production

jobs:
  migrate:
    runs-on: ubuntu-latest
    environment: ${{ github.event.inputs.environment }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      
      - name: Backup Database
        run: |
          pg_dump $DATABASE_URL > backup-$(date +%Y%m%d-%H%M%S).sql
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
      
      - name: Run Migrations
        run: npm run db:migrate
        env:
          DIRECT_URL: ${{ secrets.DIRECT_URL }}
      
      - name: Verify Migration
        run: npm run db:studio --headless
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

## Health Checks and Monitoring

### Health Check Endpoint
```typescript
// server/api/health.get.ts
export default defineEventHandler(async (event) => {
  try {
    // Check database connection
    const db = useDrizzle()
    await db.execute(sql`SELECT 1`)
    
    // Check email service
    const emailHealthy = await checkEmailService()
    
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks: {
        database: 'ok',
        email: emailHealthy ? 'ok' : 'warning'
      }
    }
  } catch (error) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Service Unavailable'
    })
  }
})
```

### Monitoring Setup

#### Application Monitoring
```typescript
// plugins/monitoring.client.ts
export default defineNuxtPlugin(() => {
  if (process.env.NODE_ENV === 'production') {
    // Initialize error tracking
    import('@sentry/vue').then(Sentry => {
      Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV
      })
    })
    
    // Initialize analytics
    if (process.env.GOOGLE_ANALYTICS_ID) {
      // Setup GA4
    }
  }
})
```

#### Performance Monitoring
```typescript
// server/middleware/metrics.ts
export default defineEventHandler(async (event) => {
  const start = Date.now()
  
  // Continue to next handler
  await event.next()
  
  const duration = Date.now() - start
  
  // Log slow requests
  if (duration > 1000) {
    console.warn(`Slow request: ${event.node.req.url} took ${duration}ms`)
  }
  
  // Send metrics to monitoring service
  if (process.env.NODE_ENV === 'production') {
    // Send to monitoring service
  }
})
```

## Security Considerations

### Production Security Headers
```typescript
// server/middleware/security.ts
export default defineEventHandler(async (event) => {
  if (process.env.NODE_ENV === 'production') {
    setHeaders(event, {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'"
    })
  }
})
```

### Environment Secrets Management
```bash
# Use platform-specific secret management
# Vercel
vercel env add SECRET_NAME production

# Railway
railway variables set SECRET_NAME=value

# Fly.io
fly secrets set SECRET_NAME=value

# Never commit secrets to git
echo "*.env*" >> .gitignore
```

## Performance Optimization

### Build Optimization
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  nitro: {
    preset: 'vercel-edge', // or platform-specific preset
    minify: true,
    compressPublicAssets: true
  },
  
  experimental: {
    payloadExtraction: false // Disable for better edge performance
  },
  
  ssr: true, // Enable SSR for better SEO
  
  runtimeConfig: {
    // Server-only secrets
    sessionPassword: process.env.NUXT_SESSION_PASSWORD,
    resendApiKey: process.env.RESEND_API_KEY,
    
    public: {
      // Client-exposed config
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL
    }
  }
})
```

### Database Performance
```typescript
// Enable connection pooling in production
const db = drizzle(postgres(process.env.DATABASE_URL!, {
  max: 20, // Maximum pool size
  idle_timeout: 20000,
  connection_timeout: 2000
}))
```

## Rollback Strategy

### Quick Rollback
```bash
# Platform-specific rollback commands

# Vercel
vercel rollback [deployment-url]

# Railway
railway rollback

# Fly.io
fly deploy --image [previous-image]
```

### Database Rollback
```bash
# Restore from backup
psql $DATABASE_URL < backup-before-migration.sql

# Or use point-in-time recovery (Supabase)
# Restore to specific timestamp via Supabase dashboard
```

## Domain and SSL Setup

### Custom Domain Configuration
```bash
# Vercel
vercel domains add yourdomain.com

# Netlify
netlify domains:create yourdomain.com

# Update DNS records
# A record: @ -> [platform-ip]
# CNAME: www -> [platform-domain]
```

### SSL Certificate
Most platforms provide automatic SSL via Let's Encrypt. No manual configuration needed.

## Post-Deployment Checklist

### Immediate Checks
- [ ] Application loads successfully
- [ ] Health check endpoint responds
- [ ] Database connection working
- [ ] Email sending functional
- [ ] Authentication flow working
- [ ] Admin panel accessible
- [ ] SSL certificate active

### User Acceptance Testing
- [ ] User registration and verification
- [ ] Login and logout
- [ ] Project creation and management
- [ ] Support ticket system
- [ ] Admin user management
- [ ] Email notifications

### Performance Validation
- [ ] Page load times < 3 seconds
- [ ] API response times < 500ms
- [ ] Database query performance
- [ ] Email delivery times

### Monitoring Setup
- [ ] Error tracking configured
- [ ] Performance monitoring active
- [ ] Health checks running
- [ ] Backup verification
- [ ] Alert notifications configured

## Maintenance and Updates

### Regular Maintenance Tasks
```bash
# Weekly
- Review error logs
- Check performance metrics
- Verify backup integrity
- Update dependencies (security patches)

# Monthly
- Full security audit
- Performance optimization review
- Database maintenance
- Dependency updates

# Quarterly
- Infrastructure review
- Cost optimization
- Disaster recovery testing
- Feature deployment planning
```

### Update Deployment Process
1. **Development** → Test locally
2. **Staging** → Deploy and test features
3. **Production** → Gradual rollout with monitoring
4. **Post-deployment** → Monitor metrics and user feedback

This deployment strategy ensures reliable, secure, and performant delivery of the Kaygia Web platform across all environments.
# Database Migration Guide

> Last updated: January 2025  
> ORM: Drizzle with PostgreSQL  
> Migration Tool: Drizzle Kit

## Overview

Kaygia Web uses Drizzle ORM with a custom migration system for safe, version-controlled database changes. All migrations are stored in version control and can be applied to any environment.

## Migration Workflow

### Development → Production Flow
```
1. Modify Schema (server/db/schema.ts)
2. Generate Migration (npm run db:generate)
3. Review Migration Files
4. Test Locally (npm run db:migrate)
5. Commit Migration Files
6. Deploy to Staging
7. Apply to Production
```

## Commands

### Core Migration Commands
```bash
# Generate new migration from schema changes
npm run db:generate

# Apply pending migrations
npm run db:migrate

# Push schema directly (development only - bypasses migrations)
npm run db:push

# Open database management UI
npm run db:studio
```

### Drizzle Kit Commands
```bash
# Generate migration with custom name
npx drizzle-kit generate --name="add_user_preferences"

# Check migration status
npx drizzle-kit status

# View current schema
npx drizzle-kit introspect
```

## Migration Files

### Location and Structure
```
server/db/migrations/
├── 0000_clumsy_frank_castle.sql    # Initial schema
├── 0001_happy_hairball.sql         # FK constraint updates
├── 0002_wooden_falcon.sql          # Added ticket_number
├── 0003_tiny_tony_stark.sql        # Added active column
├── 0004_left_the_anarchist.sql     # Added SUPER_ADMIN role
└── meta/
    ├── _journal.json               # Migration metadata
    ├── 0000_snapshot.json          # Schema snapshots
    ├── 0001_snapshot.json
    └── ...
```

### Migration File Format
```sql
-- 0005_example_migration.sql
DO $$ BEGIN
 CREATE TYPE "new_enum" AS ENUM('VALUE1', 'VALUE2');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "table_name" ADD COLUMN "new_column" text;
ALTER TABLE "table_name" ALTER COLUMN "existing_column" SET NOT NULL;

CREATE INDEX "idx_table_column" ON "table_name"("column_name");
```

## Migration History

### 0000_clumsy_frank_castle.sql (Initial Schema)
**Date**: Project initialization  
**Description**: Created base schema with all core tables

**Changes**:
- Created `users` table with authentication fields
- Created `projects` table with client relationships
- Created `support_tickets` table for customer support
- Created `ticket_comments` table for communication
- Created `password_resets` table for password recovery
- Created `email_verifications` table for email verification
- Defined all enum types (role, project_status, etc.)
- Set up foreign key relationships with NO ACTION

### 0001_happy_hairball.sql (FK Constraint Updates)
**Date**: Project initialization  
**Description**: Updated foreign key constraints for data integrity

**Changes**:
- Changed all foreign key constraints from `NO ACTION` to `CASCADE DELETE`
- Ensures related data is cleaned up when parent records are deleted
- Affects: projects, support_tickets, ticket_comments, password_resets, email_verifications

### 0002_wooden_falcon.sql (Ticket Number Addition)
**Date**: Project initialization  
**Description**: Added human-readable ticket numbers

**Changes**:
- Added `ticket_number` column to `support_tickets` table
- Set as unique constraint for easy ticket identification
- Allows for formatted ticket numbers (e.g., "TICK-001")

### 0003_tiny_tony_stark.sql (User Active Status)
**Date**: Project initialization  
**Description**: Added account activation functionality

**Changes**:
- Added `active` boolean column to `users` table
- Default value: `true`
- Allows admin to deactivate user accounts without deletion

### 0004_left_the_anarchist.sql (Super Admin Role)
**Date**: Project initialization  
**Description**: Extended role system with super admin

**Changes**:
- Added `SUPER_ADMIN` value to `role` enum
- Enables hierarchical admin permissions
- Supports multi-level administrative access

## Creating New Migrations

### 1. Schema Modification Workflow

#### Step 1: Update Schema
```typescript
// server/db/schema.ts
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').unique().notNull(),
  // Add new column
  preferences: jsonb('preferences'),
  // Modify existing column
  name: text('name').notNull(), // Made required
});
```

#### Step 2: Generate Migration
```bash
npm run db:generate
```

#### Step 3: Review Generated Migration
```sql
-- Check generated file in server/db/migrations/
-- Verify the changes are correct
-- Add any custom logic if needed
```

#### Step 4: Test Migration
```bash
# Apply to local database
npm run db:migrate

# Verify with database studio
npm run db:studio
```

### 2. Common Migration Patterns

#### Adding New Table
```typescript
// In schema.ts
export const newTable = pgTable('new_table', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull()
});
```

#### Adding Index
```typescript
// In schema.ts
export const users = pgTable('users', {
  // ... existing columns
}, (table) => ({
  emailIdx: index('idx_users_email').on(table.email),
  roleIdx: index('idx_users_role').on(table.role)
}));
```

#### Modifying Enum
```typescript
// Add new enum value
export const roleEnum = pgEnum('role', ['CLIENT', 'ADMIN', 'SUPER_ADMIN', 'MODERATOR']);
```

#### Adding Foreign Key
```typescript
export const newTable = pgTable('new_table', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { 
    onDelete: 'cascade',
    onUpdate: 'cascade'
  })
});
```

### 3. Advanced Migration Scenarios

#### Data Migration
```sql
-- In custom migration file
-- Update existing data
UPDATE users SET role = 'CLIENT' WHERE role IS NULL;

-- Transform data
UPDATE projects SET budget = budget * 100 WHERE budget IS NOT NULL;
```

#### Conditional Changes
```sql
-- Check if column exists before adding
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'preferences'
  ) THEN
    ALTER TABLE users ADD COLUMN preferences jsonb;
  END IF;
END $$;
```

#### Complex Constraints
```sql
-- Add check constraint
ALTER TABLE projects ADD CONSTRAINT budget_positive 
CHECK (budget IS NULL OR budget > 0);

-- Add unique constraint on multiple columns
ALTER TABLE projects ADD CONSTRAINT unique_client_title 
UNIQUE (client_id, title);
```

## Production Migration Strategy

### Pre-Migration Checklist
- [ ] **Backup Database**: Create full backup before migration
- [ ] **Test on Staging**: Apply migration to staging environment
- [ ] **Review Changes**: Ensure migration does what's expected
- [ ] **Plan Rollback**: Prepare rollback strategy if needed
- [ ] **Check Dependencies**: Verify no application code depends on old schema
- [ ] **Monitor Performance**: Large migrations may impact performance

### Migration Execution

#### Development Environment
```bash
# Standard migration
npm run db:migrate
```

#### Production Environment
```bash
# Set production database URL
export DIRECT_URL="postgresql://prod-connection-string"

# Apply migrations
npm run db:migrate

# Verify success
npm run db:studio
```

### Environment Variables for Production
```env
# Production database (for migrations)
DIRECT_URL="postgresql://user:pass@prod-host:5432/kaygia_web"

# Application database (for runtime)
DATABASE_URL="postgresql://user:pass@prod-host:5432/kaygia_web"
```

## Rollback Strategies

### 1. Manual Rollback
```sql
-- Identify migration to rollback
-- Manually write reverse SQL commands
-- Example: Rolling back column addition
ALTER TABLE users DROP COLUMN preferences;
```

### 2. Database Restore
```bash
# Restore from backup (if migration causes issues)
pg_restore -d kaygia_web backup_before_migration.sql
```

### 3. Migration Branching
```bash
# Create new migration to undo changes
npm run db:generate
# Edit generated migration to reverse previous changes
```

## Best Practices

### Schema Design
- **Use descriptive names** for tables and columns
- **Add indexes** for foreign keys and frequently queried columns
- **Use appropriate data types** (text vs varchar, timestamp vs date)
- **Set proper constraints** (NOT NULL, UNIQUE, CHECK)
- **Use enums** for fixed value sets

### Migration Safety
- **Never modify existing migrations** once they're deployed
- **Test migrations thoroughly** before production
- **Keep migrations small** and focused
- **Use transactions** for complex migrations
- **Document breaking changes** in migration comments

### Performance Considerations
- **Add indexes concurrently** in production:
  ```sql
  CREATE INDEX CONCURRENTLY idx_table_column ON table_name(column);
  ```
- **Avoid long-running migrations** during peak hours
- **Consider maintenance windows** for large schema changes
- **Monitor query performance** after migrations

## Troubleshooting

### Common Issues

#### Migration Fails
```bash
# Check error message
npm run db:migrate

# Check database connection
psql $DIRECT_URL -c "SELECT 1"

# Verify schema file syntax
npx tsc --noEmit server/db/schema.ts
```

#### Schema Drift
```bash
# Check current schema vs expected
npm run db:studio

# Regenerate from current state
npm run db:generate --name="fix_schema_drift"
```

#### Permission Issues
```sql
-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE kaygia_web TO username;
GRANT USAGE, CREATE ON SCHEMA public TO username;
```

### Recovery Procedures

#### Corrupted Migration
1. **Identify the issue** in migration file
2. **Fix the migration** SQL manually
3. **Test fix** on development database
4. **Apply corrected migration** to production

#### Failed Production Migration
1. **Stop application** to prevent data corruption
2. **Restore from backup** if necessary
3. **Fix migration issue** in development
4. **Re-deploy with corrected migration**

## Development Workflow Integration

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/new-table

# Modify schema
# Generate migration
npm run db:generate

# Test migration
npm run db:migrate

# Commit schema + migration files
git add server/db/schema.ts server/db/migrations/
git commit -m "Add user preferences table"

# Push and create PR
git push origin feature/new-table
```

### CI/CD Integration
```bash
# In deployment pipeline
# 1. Run migrations before app deployment
npm run db:migrate

# 2. Start application
npm run build
npm start
```

This migration system ensures safe, version-controlled database evolution while maintaining data integrity across all environments.
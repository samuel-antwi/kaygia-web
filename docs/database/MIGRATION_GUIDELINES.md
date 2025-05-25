# Database Migration Guidelines

## 🚨 CRITICAL: Preventing Duplicate Migrations

### The Problem
Manually creating migration files can lead to:
- Duplicate migration numbers
- Conflicts with Drizzle's tracking system  
- Database inconsistencies
- Failed deployments

### ⛔ NEVER Do This

```bash
# ❌ WRONG - Never manually create migration files
echo "ALTER TABLE..." > server/db/migrations/0017_my_migration.sql

# ❌ WRONG - Never copy and rename migration files
cp 0016_migration.sql 0017_new_migration.sql

# ❌ WRONG - Never manually number migrations
touch server/db/migrations/0018_custom_migration.sql
```

## ✅ ALWAYS Follow This Process

### 1. Check Existing Migrations First
```bash
# Always check the latest migration number before any changes
ls server/db/migrations/ | grep -E "^[0-9]+" | sort -n | tail -5
```

### 2. Use Drizzle's Migration Commands

#### For Schema Changes:
```bash
# 1. Update the schema file
# Edit: server/db/schema.ts

# 2. Generate migration automatically
npm run db:generate

# 3. Review the generated migration
# Check: server/db/migrations/00XX_generated_name.sql

# 4. Apply the migration
npm run db:migrate
```

#### For Development:
```bash
# Push schema changes without migrations (dev only)
npm run db:push
```

### 3. Manual Database Changes (When Absolutely Necessary)

#### Option A: Temporary Script (Recommended)
```typescript
// scripts/one-time-db-change.ts
import { db } from "../server/db/index";
import { sql } from "drizzle-orm";

async function applyChange() {
  await db.execute(sql`
    ALTER TABLE projects 
    ADD COLUMN IF NOT EXISTS new_column TEXT
  `);
  console.log("Change applied successfully");
  process.exit(0);
}

applyChange();
```

Run with: `npx tsx scripts/one-time-db-change.ts`

#### Option B: Direct SQL (Emergency Only)
If you must run SQL directly:
1. Document the change in this file
2. Update schema.ts to match
3. Run `npm run db:generate` to verify sync

## 📋 Migration Checklist

Before making any database changes:

- [ ] Check latest migration number: `ls server/db/migrations/ | tail -5`
- [ ] Update `server/db/schema.ts` with changes
- [ ] Run `npm run db:generate` to create migration
- [ ] Review generated migration file
- [ ] Test migration locally: `npm run db:migrate`
- [ ] Commit both schema.ts and migration file together

## 🚨 Recovering from Duplicate Migrations

If duplicate migrations are accidentally created:

1. **Check migration tracking:**
   ```sql
   SELECT * FROM drizzle.__drizzle_migrations ORDER BY id DESC LIMIT 10;
   ```

2. **Identify untracked duplicates:**
   ```bash
   ls server/db/migrations/ | grep -E "^0017" # Example for checking 0017
   ```

3. **Remove untracked migration files:**
   ```bash
   rm server/db/migrations/0017_duplicate_name.sql
   ```

4. **Verify schema sync:**
   ```bash
   npm run db:generate # Should show "No schema changes"
   ```

## 🎯 Golden Rules

1. **Schema First**: Always update schema.ts before generating migrations
2. **Never Manual**: Never manually create numbered migration files
3. **Check First**: Always check existing migrations before changes
4. **Track Everything**: Let Drizzle track all migrations
5. **Test Locally**: Always test migrations before committing

## 📝 Examples of What Went Wrong

### Case 1: Manual Migration Creation
```bash
# ❌ What happened:
touch server/db/migrations/0017_add_phase_template.sql
# Later, Drizzle generated its own 0017_loose_loki.sql
# Result: Two migrations with same number!
```

### Case 2: The Right Way
```bash
# ✅ What should have happened:
# 1. Update schema.ts with new columns
# 2. npm run db:generate
# 3. npm run db:migrate
# Result: Drizzle handles everything correctly
```

## 🔧 Useful Commands

```bash
# Check migration status
npm run db:studio           # Visual database browser

# Migration commands
npm run db:generate        # Generate new migration from schema changes
npm run db:migrate         # Apply pending migrations
npm run db:push           # Push schema without migrations (dev only)

# Verification
npx drizzle-kit check     # Verify schema consistency
```

## ⚠️ Important Notes

- Migration files are **append-only** - never edit existing migrations
- Migrations must be applied in order
- Each migration is tracked by hash in `__drizzle_migrations` table
- Production migrations should always be tested locally first

---

**Last Updated**: January 2025  
**Reason**: Duplicate migration incident with 0017_add_phase_template.sql
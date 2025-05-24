# Soft Delete Implementation

## Overview

Users are now soft-deleted instead of being permanently removed from the database. This provides better data integrity, audit trails, and the ability to recover accidentally deleted accounts.

## How It Works

1. **Delete Action**: When a SUPER_ADMIN deletes a user:
   - The `deletedAt` timestamp is set to the current date/time
   - The `active` field is set to `false`
   - The user record remains in the database

2. **Filtering**: Soft-deleted users are automatically excluded from:
   - User lists in admin panel
   - Login attempts
   - Profile lookups
   - All queries using `isNull(users.deletedAt)`

## Database Changes

Added `deletedAt` column to users table:
```sql
ALTER TABLE users ADD COLUMN deleted_at timestamp;
```

## API Implementation

### Delete Endpoint
```typescript
// Soft delete instead of hard delete
await db
  .update(users)
  .set({ 
    deletedAt: now,
    active: false,
    updatedAt: now
  })
  .where(eq(users.id, userId));
```

### Query Filtering
```typescript
// Example: Get all non-deleted users
const allUsers = await db.query.users.findMany({
  where: isNull(users.deletedAt),
  // ... rest of query
});
```

## Benefits

1. **Data Recovery**: Can restore accidentally deleted users
2. **Audit Trail**: Maintains record of who was deleted and when
3. **Referential Integrity**: Associated data (projects, tickets) remains intact
4. **Compliance**: Better for regulatory requirements
5. **Analytics**: Historical data preserved for reporting

## Future Enhancements

### 1. Restore Functionality
Add ability for SUPER_ADMIN to restore soft-deleted users:
```typescript
// Restore user
await db
  .update(users)
  .set({ 
    deletedAt: null,
    active: true,
    updatedAt: now
  })
  .where(eq(users.id, userId));
```

### 2. Permanent Delete
Add option to permanently delete after certain period:
- Soft-deleted users older than 90 days
- With SUPER_ADMIN confirmation
- After data export

### 3. Deleted Users View
Create a separate view for SUPER_ADMIN to:
- See all soft-deleted users
- View deletion date and who deleted them
- Restore or permanently delete

## Security Considerations

- Soft-deleted users cannot log in
- Their data is excluded from all normal queries
- Only SUPER_ADMIN can delete users
- Consider adding deletion reason field for audit purposes
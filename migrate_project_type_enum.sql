-- Migration script to update project_type enum
-- From: MARKETING, BRANDING, OTHER, MOBILE_APP
-- To: WEBSITE, E_COMMERCE, WEB_APP, LANDING_PAGE

BEGIN;

-- Step 1: Check current enum values and project data
SELECT 'Current project types:' as info;
SELECT type, COUNT(*) as count 
FROM projects 
GROUP BY type 
ORDER BY count DESC;

-- Step 2: Add new enum values temporarily (if they don't exist)
-- First, let's create the new enum type
DO $$
BEGIN
    -- Create a new enum type with the desired values
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'project_type_new') THEN
        CREATE TYPE project_type_new AS ENUM ('WEBSITE', 'E_COMMERCE', 'WEB_APP', 'LANDING_PAGE');
    END IF;
END$$;

-- Step 3: Add a temporary column with the new enum type
ALTER TABLE projects ADD COLUMN type_new project_type_new;

-- Step 4: Update existing projects to map old values to new ones
UPDATE projects SET type_new = 
    CASE 
        WHEN type::text = 'MARKETING' THEN 'LANDING_PAGE'::project_type_new
        WHEN type::text = 'BRANDING' THEN 'WEBSITE'::project_type_new
        WHEN type::text = 'OTHER' THEN 'WEBSITE'::project_type_new
        WHEN type::text = 'MOBILE_APP' THEN 'WEB_APP'::project_type_new
        -- Handle cases where values might already be correct
        WHEN type::text = 'WEBSITE' THEN 'WEBSITE'::project_type_new
        WHEN type::text = 'E_COMMERCE' THEN 'E_COMMERCE'::project_type_new
        WHEN type::text = 'WEB_APP' THEN 'WEB_APP'::project_type_new
        WHEN type::text = 'LANDING_PAGE' THEN 'LANDING_PAGE'::project_type_new
        ELSE 'WEBSITE'::project_type_new -- Default fallback
    END;

-- Step 5: Check the mapping results
SELECT 'Mapping results:' as info;
SELECT 
    type as old_type, 
    type_new as new_type, 
    COUNT(*) as count 
FROM projects 
GROUP BY type, type_new 
ORDER BY count DESC;

-- Step 6: Drop the old column and rename the new one
ALTER TABLE projects DROP COLUMN type;
ALTER TABLE projects RENAME COLUMN type_new TO type;

-- Step 7: Set NOT NULL constraint
ALTER TABLE projects ALTER COLUMN type SET NOT NULL;

-- Step 8: Drop the old enum type and rename the new one
DROP TYPE IF EXISTS project_type CASCADE;
ALTER TYPE project_type_new RENAME TO project_type;

-- Step 9: Verify final results
SELECT 'Final project types:' as info;
SELECT type, COUNT(*) as count 
FROM projects 
GROUP BY type 
ORDER BY count DESC;

-- Step 10: Check enum definition
SELECT 'Available enum values:' as info;
SELECT enumlabel as enum_value 
FROM pg_enum 
JOIN pg_type ON pg_enum.enumtypid = pg_type.oid 
WHERE pg_type.typname = 'project_type'
ORDER BY enumsortorder;

COMMIT;
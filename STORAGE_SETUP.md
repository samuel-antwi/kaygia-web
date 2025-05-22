# 🪣 Supabase Storage Setup Guide

## ✅ Current Status

**Storage buckets have been created successfully:**

- ✅ `project-files` (private, 25MB limit)
- ✅ `project-deliverables` (private, 100MB limit)  
- ✅ `user-avatars` (public, 5MB limit)

## 🔒 Manual RLS Setup (Optional)

For production security, you may want to set up Row Level Security policies manually:

### 1. Go to Supabase Dashboard
- Navigate to **Authentication > Policies**
- Click on **storage** > **objects** table

### 2. Create Policies (Optional - for enhanced security)

#### For `project-files`:
```sql
-- Allow users to upload files to their own projects
CREATE POLICY "project_files_upload" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'project-files' AND
  auth.uid()::text IN (
    SELECT client_id FROM public.projects 
    WHERE id = (storage.foldername(name))[1]
  )
);

-- Allow users to view files from their own projects
CREATE POLICY "project_files_select" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'project-files' AND
  auth.uid()::text IN (
    SELECT client_id FROM public.projects 
    WHERE id = (storage.foldername(name))[1]
  )
);
```

#### For `user-avatars`:
```sql
-- Allow users to upload their own avatars
CREATE POLICY "avatars_upload" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'user-avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public viewing of avatars
CREATE POLICY "avatars_select" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'user-avatars');
```

## 🧪 Testing Storage

Your storage is ready to use! Test it by:

1. **Starting your development server:**
   ```bash
   npm run dev
   ```

2. **Navigate to a project page and try uploading files**

3. **Check the Supabase Storage dashboard** to see uploaded files

## 📁 File Organization

Files are organized in buckets as follows:

```
project-files/
├── {projectId}/
│   ├── images/
│   ├── documents/
│   └── other/

project-deliverables/
├── {projectId}/
│   ├── wireframes/
│   ├── designs/
│   └── previews/

user-avatars/
├── {userId}/
│   └── avatar.jpg
```

## 🔧 Troubleshooting

### File Upload Issues:
1. **Check bucket exists** - Run `npx tsx scripts/check-storage.ts`
2. **Verify file size limits** - Max 25MB for project files
3. **Check MIME types** - Validation handled in API

### Access Issues:
1. **User authentication** - Ensure user is logged in
2. **Project ownership** - User must own the project to upload files
3. **CORS settings** - May need configuration for frontend access

## 🎯 Next Steps

Your file management system is now fully functional with:

- ✅ **File uploads** via API endpoints
- ✅ **Secure downloads** with signed URLs
- ✅ **File organization** by project and type
- ✅ **Size and type validation**
- ✅ **User access control**

Start testing file uploads in your project pages!
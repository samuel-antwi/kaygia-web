import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:')
  console.error('   - SUPABASE_URL')
  console.error('   - SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// Initialize Supabase admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Define buckets to create
const bucketsToCreate = [
  {
    id: 'project-files',
    name: 'Project Files',
    public: false,
    fileSizeLimit: 25 * 1024 * 1024, // 25MB
    allowedMimeTypes: null, // We handle validation in API
  },
  {
    id: 'project-deliverables', 
    name: 'Project Deliverables',
    public: false,
    fileSizeLimit: 100 * 1024 * 1024, // 100MB
    allowedMimeTypes: null,
  },
  {
    id: 'user-avatars',
    name: 'User Avatars',
    public: true,
    fileSizeLimit: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  }
]

// RLS Policies for secure access
const rlsPolicies = [
  // Project Files Policies
  {
    bucketId: 'project-files',
    name: 'Users can upload to own projects',
    definition: `
      CREATE POLICY "Users can upload to own projects" ON storage.objects
      FOR INSERT TO authenticated
      WITH CHECK (
        bucket_id = 'project-files' AND
        auth.uid()::text IN (
          SELECT client_id FROM public.projects 
          WHERE id = (storage.foldername(name))[1]
        )
      );
    `
  },
  {
    bucketId: 'project-files',
    name: 'Users can view own project files',
    definition: `
      CREATE POLICY "Users can view own project files" ON storage.objects
      FOR SELECT TO authenticated
      USING (
        bucket_id = 'project-files' AND
        auth.uid()::text IN (
          SELECT client_id FROM public.projects 
          WHERE id = (storage.foldername(name))[1]
        )
      );
    `
  },
  {
    bucketId: 'project-files',
    name: 'Users can delete own project files',
    definition: `
      CREATE POLICY "Users can delete own project files" ON storage.objects
      FOR DELETE TO authenticated
      USING (
        bucket_id = 'project-files' AND
        auth.uid()::text IN (
          SELECT client_id FROM public.projects 
          WHERE id = (storage.foldername(name))[1]
        )
      );
    `
  },
  // Project Deliverables Policies
  {
    bucketId: 'project-deliverables',
    name: 'Users can view own project deliverables',
    definition: `
      CREATE POLICY "Users can view own project deliverables" ON storage.objects
      FOR SELECT TO authenticated
      USING (
        bucket_id = 'project-deliverables' AND
        auth.uid()::text IN (
          SELECT client_id FROM public.projects 
          WHERE id = (storage.foldername(name))[1]
        )
      );
    `
  },
  // User Avatars Policies (public bucket, simpler policies)
  {
    bucketId: 'user-avatars',
    name: 'Users can upload own avatars',
    definition: `
      CREATE POLICY "Users can upload own avatars" ON storage.objects
      FOR INSERT TO authenticated
      WITH CHECK (
        bucket_id = 'user-avatars' AND
        auth.uid()::text = (storage.foldername(name))[1]
      );
    `
  },
  {
    bucketId: 'user-avatars',
    name: 'Anyone can view avatars',
    definition: `
      CREATE POLICY "Anyone can view avatars" ON storage.objects
      FOR SELECT TO public
      USING (bucket_id = 'user-avatars');
    `
  }
]

async function createStorageBuckets() {
  console.log('🚀 Setting up Supabase Storage buckets...\n')

  try {
    // 1. Create buckets
    for (const bucket of bucketsToCreate) {
      console.log(`📁 Creating bucket: ${bucket.id}`)
      
      const { data, error } = await supabase.storage.createBucket(bucket.id, {
        public: bucket.public,
        fileSizeLimit: bucket.fileSizeLimit,
        allowedMimeTypes: bucket.allowedMimeTypes
      })

      if (error) {
        if (error.message.includes('already exists')) {
          console.log(`   ✅ Bucket '${bucket.id}' already exists`)
        } else {
          console.error(`   ❌ Error creating bucket '${bucket.id}':`, error.message)
        }
      } else {
        console.log(`   ✅ Created bucket '${bucket.id}' successfully`)
      }
    }

    console.log('\n🔒 Setting up Row Level Security (RLS) policies...\n')

    // 2. Enable RLS on storage.objects (if not already enabled)
    const enableRLS = `
      ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
    `
    
    const { error: rlsError } = await supabase.rpc('exec_sql', { sql: enableRLS })
    if (rlsError && !rlsError.message.includes('already exists')) {
      console.log('⚠️  RLS might already be enabled on storage.objects')
    }

    // 3. Create RLS policies
    for (const policy of rlsPolicies) {
      console.log(`🛡️  Creating policy: ${policy.name}`)
      
      // Drop policy if it exists, then create it
      const dropPolicy = `DROP POLICY IF EXISTS "${policy.name}" ON storage.objects;`
      await supabase.rpc('exec_sql', { sql: dropPolicy })
      
      const { error: policyError } = await supabase.rpc('exec_sql', { 
        sql: policy.definition.trim() 
      })

      if (policyError) {
        console.error(`   ❌ Error creating policy '${policy.name}':`, policyError.message)
      } else {
        console.log(`   ✅ Created policy '${policy.name}' successfully`)
      }
    }

    console.log('\n✅ Storage setup completed successfully!')
    console.log('\n📋 Summary:')
    console.log('   • 3 storage buckets created')
    console.log('   • Row Level Security enabled')
    console.log('   • Access policies configured')
    console.log('\n🎯 Your storage is ready for file uploads!')

  } catch (error) {
    console.error('❌ Setup failed:', error)
    process.exit(1)
  }
}

// Helper function to check if buckets exist
async function checkBuckets() {
  console.log('\n🔍 Checking existing buckets...\n')
  
  const { data: buckets, error } = await supabase.storage.listBuckets()
  
  if (error) {
    console.error('Error listing buckets:', error)
    return
  }

  if (buckets.length === 0) {
    console.log('No buckets found. Creating new ones...')
  } else {
    console.log('Existing buckets:')
    buckets.forEach(bucket => {
      console.log(`   • ${bucket.id} (${bucket.public ? 'public' : 'private'})`)
    })
  }
}

// Main execution
async function main() {
  await checkBuckets()
  await createStorageBuckets()
}

main().catch(console.error)
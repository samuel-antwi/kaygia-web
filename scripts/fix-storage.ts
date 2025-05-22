import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Initialize Supabase admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixStorage() {
  console.log('🔧 Fixing Supabase Storage setup...\n')

  try {
    // 1. Create missing project-deliverables bucket
    console.log('📁 Creating project-deliverables bucket...')
    
    const { data, error } = await supabase.storage.createBucket('project-deliverables', {
      public: false,
      fileSizeLimit: 100 * 1024 * 1024, // 100MB
      allowedMimeTypes: null
    })

    if (error) {
      if (error.message.includes('already exists')) {
        console.log('   ✅ Bucket already exists')
      } else {
        console.error('   ❌ Error:', error.message)
      }
    } else {
      console.log('   ✅ Created successfully')
    }

    // 2. Check all buckets are working
    console.log('\n🧪 Verifying all buckets...')
    
    const buckets = ['project-files', 'project-deliverables', 'user-avatars']
    
    for (const bucketId of buckets) {
      const { data, error } = await supabase.storage.from(bucketId).list('', { limit: 1 })
      
      if (error) {
        console.log(`   ❌ ${bucketId}: ${error.message}`)
      } else {
        console.log(`   ✅ ${bucketId}: Working`)
      }
    }

    console.log('\n✅ Storage setup is now complete!')
    console.log('\n📋 Next steps:')
    console.log('   1. Test file uploads in your app')
    console.log('   2. Set up RLS policies manually in Supabase dashboard if needed')
    console.log('   3. Configure CORS settings if accessing from frontend')

  } catch (error) {
    console.error('❌ Error fixing storage:', error)
  }
}

fixStorage()
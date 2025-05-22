import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Initialize Supabase admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkStorage() {
  console.log('🔍 Checking Supabase Storage status...\n')

  try {
    // Check buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      console.error('❌ Error listing buckets:', bucketsError)
      return
    }

    console.log('📁 Storage Buckets:')
    if (buckets.length === 0) {
      console.log('   No buckets found')
    } else {
      buckets.forEach(bucket => {
        console.log(`   ✅ ${bucket.id} (${bucket.public ? 'public' : 'private'})`)
        if (bucket.file_size_limit) {
          console.log(`      File size limit: ${Math.round(bucket.file_size_limit / 1024 / 1024)}MB`)
        }
      })
    }

    console.log('\n🧪 Testing bucket access...')
    
    // Test each bucket
    const testBuckets = ['project-files', 'project-deliverables', 'user-avatars']
    
    for (const bucketId of testBuckets) {
      const { data, error } = await supabase.storage.from(bucketId).list('', { limit: 1 })
      
      if (error) {
        console.log(`   ❌ ${bucketId}: ${error.message}`)
      } else {
        console.log(`   ✅ ${bucketId}: Accessible`)
      }
    }

  } catch (error) {
    console.error('❌ Error checking storage:', error)
  }
}

checkStorage()
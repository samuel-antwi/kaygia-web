import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Initialize Supabase admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createDeliverablesBucket() {
  console.log('🔧 Creating project-deliverables bucket...\n')

  try {
    // Try creating with different size limits
    const sizeLimits = [
      { size: 50 * 1024 * 1024, label: '50MB' },
      { size: 25 * 1024 * 1024, label: '25MB' }, 
      { size: 10 * 1024 * 1024, label: '10MB' },
      { size: null, label: 'no limit' }
    ]

    for (const limit of sizeLimits) {
      console.log(`📁 Trying to create with ${limit.label} limit...`)
      
      const { data, error } = await supabase.storage.createBucket('project-deliverables', {
        public: false,
        fileSizeLimit: limit.size,
        allowedMimeTypes: null
      })

      if (error) {
        if (error.message.includes('already exists')) {
          console.log('   ✅ Bucket already exists!')
          break
        } else {
          console.log(`   ❌ Failed with ${limit.label}: ${error.message}`)
          continue
        }
      } else {
        console.log(`   ✅ Success with ${limit.label} limit!`)
        break
      }
    }

    // Verify all buckets
    console.log('\n🔍 Checking all buckets...')
    
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError)
      return
    }

    console.log('\n📁 Your storage buckets:')
    buckets.forEach(bucket => {
      console.log(`   ✅ ${bucket.id} (${bucket.public ? 'public' : 'private'})`)
      if (bucket.file_size_limit) {
        console.log(`      File size limit: ${Math.round(bucket.file_size_limit / 1024 / 1024)}MB`)
      }
    })

    // Test access to each bucket
    console.log('\n🧪 Testing bucket access...')
    const testBuckets = ['project-files', 'project-deliverables', 'user-avatars']
    
    for (const bucketId of testBuckets) {
      const { data, error } = await supabase.storage.from(bucketId).list('', { limit: 1 })
      
      if (error) {
        console.log(`   ❌ ${bucketId}: ${error.message}`)
      } else {
        console.log(`   ✅ ${bucketId}: Working`)
      }
    }

    console.log('\n✅ Setup complete!')

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

createDeliverablesBucket()
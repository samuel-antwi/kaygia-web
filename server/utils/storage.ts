import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client for storage operations
const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY! // Service role key for server-side operations

export const supabaseStorage = createClient(supabaseUrl, supabaseServiceKey)

// Storage bucket names
export const STORAGE_BUCKETS = {
  PROJECT_FILES: 'project-files',
  PROJECT_DELIVERABLES: 'project-deliverables',
  USER_AVATARS: 'user-avatars',
} as const

// Helper function to generate file path
export const generateFilePath = (projectId: string, fileName: string, folder?: string): string => {
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
  const timestamp = Date.now()
  const uniqueFileName = `${timestamp}_${sanitizedFileName}`
  
  if (folder) {
    return `${projectId}/${folder}/${uniqueFileName}`
  }
  return `${projectId}/${uniqueFileName}`
}

// Helper function to get file extension
export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || ''
}

// Helper function to determine file type category
export const getFileTypeCategory = (mimeType: string): string => {
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.startsWith('video/')) return 'video'
  if (mimeType.startsWith('audio/')) return 'audio'
  if (mimeType.includes('pdf')) return 'pdf'
  if (mimeType.includes('document') || mimeType.includes('word')) return 'document'
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'spreadsheet'
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'presentation'
  if (mimeType.includes('text/') || mimeType.includes('code')) return 'text'
  return 'file'
}

// Helper function to check if file type is allowed
export const isAllowedFileType = (mimeType: string): boolean => {
  const allowedTypes = [
    // Images
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    // Documents
    'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    // Text files
    'text/plain', 'text/csv', 'application/json', 'text/html', 'text/css', 'text/javascript',
    // Archives
    'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed',
    // Videos (for deliverables)
    'video/mp4', 'video/quicktime', 'video/x-msvideo',
    // Audio (for deliverables)
    'audio/mpeg', 'audio/wav', 'audio/ogg',
  ]
  
  return allowedTypes.includes(mimeType)
}

// Helper function to get maximum file size by type (in bytes)
export const getMaxFileSize = (mimeType: string): number => {
  const type = getFileTypeCategory(mimeType)
  
  switch (type) {
    case 'image':
      return 10 * 1024 * 1024 // 10MB for images
    case 'video':
      return 100 * 1024 * 1024 // 100MB for videos
    case 'audio':
      return 50 * 1024 * 1024 // 50MB for audio
    default:
      return 25 * 1024 * 1024 // 25MB for other files
  }
}

// Upload file to Supabase Storage
export const uploadFile = async (
  file: File,
  bucket: string,
  path: string,
  options?: {
    cacheControl?: string
    contentType?: string
    upsert?: boolean
  }
) => {
  try {
    const { data, error } = await supabaseStorage.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: options?.cacheControl || '3600',
        contentType: options?.contentType || file.type,
        upsert: options?.upsert || false,
      })

    if (error) {
      throw new Error(`Upload failed: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error('File upload error:', error)
    throw error
  }
}

// Get public URL for a file
export const getPublicUrl = (bucket: string, path: string): string => {
  const { data } = supabaseStorage.storage
    .from(bucket)
    .getPublicUrl(path)
  
  return data.publicUrl
}

// Get signed URL for private files
export const getSignedUrl = async (
  bucket: string,
  path: string,
  expiresIn: number = 3600 // 1 hour default
): Promise<string> => {
  try {
    const { data, error } = await supabaseStorage.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn)

    if (error) {
      throw new Error(`Failed to create signed URL: ${error.message}`)
    }

    return data.signedUrl
  } catch (error) {
    console.error('Signed URL error:', error)
    throw error
  }
}

// Delete file from storage
export const deleteFile = async (bucket: string, path: string) => {
  try {
    const { error } = await supabaseStorage.storage
      .from(bucket)
      .remove([path])

    if (error) {
      throw new Error(`Delete failed: ${error.message}`)
    }

    return true
  } catch (error) {
    console.error('File deletion error:', error)
    throw error
  }
}

// List files in a directory
export const listFiles = async (bucket: string, path?: string, options?: {
  limit?: number
  offset?: number
  sortBy?: { column: string; order: 'asc' | 'desc' }
}) => {
  try {
    const { data, error } = await supabaseStorage.storage
      .from(bucket)
      .list(path, {
        limit: options?.limit || 100,
        offset: options?.offset || 0,
        sortBy: options?.sortBy || { column: 'created_at', order: 'desc' },
      })

    if (error) {
      throw new Error(`List files failed: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error('List files error:', error)
    throw error
  }
}
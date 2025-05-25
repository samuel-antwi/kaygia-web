import { createClient } from '@supabase/supabase-js'

let supabaseClient: ReturnType<typeof createClient> | null = null

export const useSupabaseClient = () => {
  if (!supabaseClient) {
    try {
      const config = useRuntimeConfig()
      const supabaseUrl = config.public.SUPABASE_URL
      const supabaseAnonKey = config.public.SUPABASE_ANON_KEY
      
      if (!supabaseUrl || !supabaseAnonKey) {
        console.error('Supabase configuration missing:', { supabaseUrl, supabaseAnonKey: !!supabaseAnonKey })
        return null
      }
      
      supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
    } catch (error) {
      console.error('Failed to initialize Supabase client:', error)
      return null
    }
  }
  
  return supabaseClient
}

export const useSupabaseUser = () => {
  const userState = useUserState()
  return computed(() => userState.user.value)
}
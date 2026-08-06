import { createClient } from '@supabase/supabase-js'
import { getSupabaseUrl, getSupabaseServiceKey } from './config'

export function createAdminClient() {
  return createClient(
    getSupabaseUrl(),
    getSupabaseServiceKey(),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        fetch: fetch.bind(globalThis),
      },
    }
  )
}

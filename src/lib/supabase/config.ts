/**
 * Centralized Supabase Configuration & Fallback Helper
 *
 * Ensures server-side code resolves the correct production Supabase URL & keys
 * even when local builds inline local dev variables from .env.local.
 */

export function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (url && url.includes('gkdbnpgaibkbmdnktbxt')) {
    return url
  }
  return 'https://gkdbnpgaibkbmdnktbxt.supabase.co'
}

export function getSupabaseAnonKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (key && (key.startsWith('sb_publishable_') || key.includes('gkdbnpgaibkbmdnktbxt'))) {
    return key
  }
  return 'sb_publishable_74iv629VJZct5-q3j-ljEg_h9u11vNr'
}

export function getSupabaseServiceKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (key && key.includes('gkdbnpgaibkbmdnktbxt')) {
    return key
  }
  return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrZGJucGdhaWJrYm1kbmt0Ynh0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTk4MTE4NywiZXhwIjoyMTAxNTU3MTg3fQ.6Xk4qISvAxuJpWU6IFWtEAvmGBcSx-4VlcJwRScPyfQ'
}

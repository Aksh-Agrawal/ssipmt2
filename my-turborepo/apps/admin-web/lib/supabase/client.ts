import { createBrowserClient } from '@supabase/ssr'
import { config } from '../config'

/**
 * Creates a Supabase client for browser/client-side usage.
 * Uses centralized configuration to ensure consistent environment variable handling.
 */
export function createClient() {
  // During unit tests we return a lightweight mock client so components
  // depending on `createClient` can call `auth.getSession()` without
  // requiring a running Supabase instance or additional env setup.
  if (process.env.NODE_ENV === 'test' || typeof process.env.JEST_WORKER_ID !== 'undefined') {
    return {
      auth: {
        getSession: async () => ({ data: { session: { access_token: 'mock-token' } }, error: null }),
      },
    } as any
  }

  return createBrowserClient(config.supabase.url, config.supabase.anonKey)
}
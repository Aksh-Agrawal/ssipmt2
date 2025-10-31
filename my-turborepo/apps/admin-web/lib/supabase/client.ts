import { createBrowserClient } from '@supabase/ssr'
import { config } from '../config'

/**
 * Creates a Supabase client for browser/client-side usage.
 * Uses centralized configuration to ensure consistent environment variable handling.
 */
export function createClient() {
  return createBrowserClient(config.supabase.url, config.supabase.anonKey)
}
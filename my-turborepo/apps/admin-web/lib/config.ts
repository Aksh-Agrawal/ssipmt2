/**
 * Centralized configuration for environment variables.
 * Validates and provides typed access to environment variables.
 * Follows coding standard: "Centralized Environment Variables"
 */

interface SupabaseConfig {
  url: string
  anonKey: string
}

interface AppConfig {
  supabase: SupabaseConfig
}

/**
 * Validates and creates the application configuration.
 * Throws early if required environment variables are missing.
 */
function createConfig(): AppConfig {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    // In test environments (Jest) and CI we prefer to return a noop/dummy
    // configuration so unit tests can import this module without requiring
    // the developer to create a .env.local file. Runtime environments still
    // require these variables and should fail fast.
    if (process.env.NODE_ENV === 'test' || typeof process.env.JEST_WORKER_ID !== 'undefined') {
      return {
        supabase: {
          url: supabaseUrl || 'http://localhost:8000',
          anonKey: supabaseAnonKey || 'test-anon-key',
        },
      }
    }

    throw new Error(
      'Missing required Supabase environment variables. ' +
      'Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your .env.local file.'
    )
  }

  return {
    supabase: {
      url: supabaseUrl,
      anonKey: supabaseAnonKey,
    },
  }
}

/**
 * Application configuration singleton.
 * Use this instead of accessing process.env directly.
 */
export const config = createConfig()

/**
 * Type-safe access to configuration values.
 */
export type { AppConfig, SupabaseConfig }
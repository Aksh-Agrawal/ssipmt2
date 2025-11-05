/**
 * Configuration for the reporting service
 * Handles environment variables and service configuration
 */

export interface ReportingConfig {
  googleCloud: {
    apiKey: string;
  };
  supabase: {
    url: string;
    serviceKey: string;
  };
}

/**
 * Validates and creates the reporting service configuration
 */
function createReportingConfig(): ReportingConfig {
  const googleCloudApiKey = process.env.GOOGLE_CLOUD_API_KEY || 'placeholder_google_cloud_api_key';
  const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseServiceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder_service_role_key';

  // Warn if using placeholder values
  if (googleCloudApiKey.startsWith('placeholder_')) {
    console.warn('⚠️ Warning: Using placeholder GOOGLE_CLOUD_API_KEY. Some features may not work.');
  }

  if (supabaseUrl.includes('placeholder')) {
    console.warn('⚠️ Warning: Using placeholder SUPABASE_URL. Some features may not work.');
  }

  if (supabaseServiceKey.startsWith('placeholder_')) {
    console.warn(
      '⚠️ Warning: Using placeholder SUPABASE_SERVICE_ROLE_KEY. Some features may not work.'
    );
  }

  return {
    googleCloud: {
      apiKey: googleCloudApiKey,
    },
    supabase: {
      url: supabaseUrl,
      serviceKey: supabaseServiceKey,
    },
  };
}

export const reportingConfig = createReportingConfig();

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
  const googleCloudApiKey = process.env.GOOGLE_CLOUD_API_KEY;
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!googleCloudApiKey) {
    throw new Error('GOOGLE_CLOUD_API_KEY environment variable is required');
  }

  if (!supabaseUrl) {
    throw new Error('SUPABASE_URL environment variable is required');
  }

  if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is required');
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
// Shared configuration utilities

export const config = {
  apiUrl: process.env.API_URL || 'http://localhost:3001',
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
};

export const getConfig = () => config;

import { createMiddleware } from 'hono/factory';
import { createClient } from '@supabase/supabase-js';

/**
 * Authentication middleware for protecting admin API routes.
 * Validates Supabase JWT tokens and ensures only authenticated users can access protected endpoints.
 */
export const authMiddleware = createMiddleware(async (c, next) => {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized - Missing or invalid Authorization header' }, 401);
  }

  const token = authHeader.substring(7);

  try {
    // Get Supabase configuration from environment
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase configuration');
      return c.json({ error: 'Server configuration error' }, 500);
    }

    // Create Supabase client to verify the JWT token
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Verify the token by getting user info
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return c.json({ error: 'Invalid or expired token' }, 401);
    }

    // Add user info to request context for use in route handlers
    c.set('user', user);
    
    await next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return c.json({ error: 'Authentication failed' }, 401);
  }
});
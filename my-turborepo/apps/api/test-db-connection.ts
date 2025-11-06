/**
 * Database Connection Test Script
 * 
 * This script tests connectivity to both PostgreSQL (Supabase) and Redis (Upstash)
 * 
 * Usage:
 *   cd my-turborepo/apps/api
 *   npx tsx test-db-connection.ts
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Redis configuration
const redisUrl = process.env.REDIS_URL || '';
const redisToken = process.env.REDIS_TOKEN || '';

console.log('🔍 Testing Database Connections...\n');

async function testSupabase() {
  console.log('📊 Testing PostgreSQL (Supabase)...');
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not found in environment');
    return false;
  }
  
  console.log(`   URL: ${supabaseUrl}`);
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Try to query the reports table
    const { data, error, count } = await supabase
      .from('reports')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.log(`❌ Supabase Error: ${error.message}`);
      return false;
    }
    
    console.log(`✅ PostgreSQL Connected!`);
    console.log(`   Total reports in database: ${count || 0}`);
    return true;
    
  } catch (error: any) {
    console.log(`❌ Connection Failed: ${error.message}`);
    return false;
  }
}

async function testRedis() {
  console.log('\n🔴 Testing Redis (Upstash)...');
  
  if (!redisUrl || !redisToken) {
    console.log('❌ REDIS_URL or REDIS_TOKEN not found in environment');
    return false;
  }
  
  console.log(`   URL: ${redisUrl}`);
  
  try {
    // Use fetch to test Redis REST API
    const response = await fetch(`${redisUrl}/ping`, {
      headers: {
        Authorization: `Bearer ${redisToken}`,
      },
    });
    
    if (!response.ok) {
      console.log(`❌ Redis Error: ${response.status} ${response.statusText}`);
      return false;
    }
    
    const result = await response.json();
    console.log(`✅ Redis Connected!`);
    console.log(`   Ping response: ${JSON.stringify(result)}`);
    
    // Try to count knowledge articles
    const keysResponse = await fetch(`${redisUrl}/keys/kb:article:*`, {
      headers: {
        Authorization: `Bearer ${redisToken}`,
      },
    });
    
    if (keysResponse.ok) {
      const keys = await keysResponse.json();
      const articleCount = Array.isArray(keys.result) ? keys.result.length : 0;
      console.log(`   Knowledge articles in database: ${articleCount}`);
    }
    
    return true;
    
  } catch (error: any) {
    console.log(`❌ Connection Failed: ${error.message}`);
    return false;
  }
}

async function testConnections() {
  console.log('═══════════════════════════════════════════════════\n');
  
  const supabaseOk = await testSupabase();
  const redisOk = await testRedis();
  
  console.log('\n═══════════════════════════════════════════════════');
  console.log('\n📋 Connection Summary:');
  console.log(`   PostgreSQL (Supabase): ${supabaseOk ? '✅ Connected' : '❌ Failed'}`);
  console.log(`   Redis (Upstash):       ${redisOk ? '✅ Connected' : '❌ Failed'}`);
  
  if (supabaseOk && redisOk) {
    console.log('\n✨ All databases are connected and ready!\n');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some databases failed to connect. Check your .env file.\n');
    console.log('Next steps:');
    if (!supabaseOk) {
      console.log('  1. Verify SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
      console.log('  2. Ensure the reports table exists (run schema.sql)');
    }
    if (!redisOk) {
      console.log('  1. Verify REDIS_URL and REDIS_TOKEN');
      console.log('  2. Check that you\'re using REST API credentials');
    }
    console.log('');
    process.exit(1);
  }
}

testConnections().catch((error) => {
  console.error('\n❌ Unexpected error:', error);
  process.exit(1);
});

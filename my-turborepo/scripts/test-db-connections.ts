/**
 * Database Connection Test Script
 * 
 * Tests connectivity to both PostgreSQL (Supabase) and Redis (Upstash)
 * 
 * Usage: npx tsx scripts/test-db-connections.ts
 */

import { createClient } from '@supabase/supabase-js';
import { Redis } from '@upstash/redis';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables from apps/api/.env
function loadEnv() {
  try {
    const envPath = join(process.cwd(), 'apps', 'api', '.env');
    const envContent = readFileSync(envPath, 'utf-8');
    
    envContent.split('\n').forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        const value = valueParts.join('=').trim();
        if (key && value) {
          process.env[key.trim()] = value;
        }
      }
    });
  } catch (error: any) {
    console.error(`Warning: Could not load .env file: ${error.message}`);
  }
}

// Load environment variables at startup
loadEnv();

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Test PostgreSQL connection via Supabase
 */
async function testPostgreSQL(): Promise<boolean> {
  log('\n📊 Testing PostgreSQL (Supabase) Connection...', 'cyan');
  
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      log('❌ Missing credentials: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY', 'red');
      log('   Add them to apps/api/.env file', 'yellow');
      return false;
    }

    log(`   URL: ${supabaseUrl}`, 'blue');
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Test 1: Simple query
    log('   Testing basic connection...', 'blue');
    const { data, error } = await supabase
      .from('reports')
      .select('count', { count: 'exact', head: true });

    if (error) {
      log(`❌ Connection failed: ${error.message}`, 'red');
      return false;
    }

    log('   ✅ Basic connection successful!', 'green');

    // Test 2: Count records
    const { count } = await supabase
      .from('reports')
      .select('*', { count: 'exact', head: true });

    log(`   ✅ Found ${count ?? 0} reports in database`, 'green');

    // Test 3: Fetch sample data
    const { data: sampleReports, error: fetchError } = await supabase
      .from('reports')
      .select('id, description, status, priority')
      .limit(3);

    if (fetchError) {
      log(`   ⚠️  Could not fetch sample data: ${fetchError.message}`, 'yellow');
    } else if (sampleReports && sampleReports.length > 0) {
      log(`   ✅ Sample records retrieved:`, 'green');
      sampleReports.forEach((report: any, idx: number) => {
        log(`      ${idx + 1}. [${report.priority}] ${report.description.substring(0, 50)}...`, 'blue');
      });
    } else {
      log(`   ⚠️  No data found. Run the schema.sql to insert sample data.`, 'yellow');
    }

    log('\n✅ PostgreSQL connection: SUCCESS', 'green');
    return true;

  } catch (error: any) {
    log(`❌ PostgreSQL connection failed: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Test Redis connection via Upstash
 */
async function testRedis(): Promise<boolean> {
  log('\n🔴 Testing Redis (Upstash) Connection...', 'cyan');
  
  try {
    const redisUrl = process.env.REDIS_URL;
    const redisToken = process.env.REDIS_TOKEN;

    if (!redisUrl || !redisToken) {
      log('❌ Missing credentials: REDIS_URL or REDIS_TOKEN', 'red');
      log('   Add them to apps/api/.env file', 'yellow');
      return false;
    }

    log(`   URL: ${redisUrl}`, 'blue');

    const redis = new Redis({
      url: redisUrl,
      token: redisToken,
    });

    // Test 1: Ping
    log('   Testing basic connection...', 'blue');
    const pingResult = await redis.ping();
    
    if (pingResult === 'PONG') {
      log('   ✅ PING successful (received PONG)', 'green');
    } else {
      log(`   ⚠️  Unexpected ping response: ${pingResult}`, 'yellow');
    }

    // Test 2: Check for knowledge articles
    log('   Checking for knowledge articles...', 'blue');
    const articleKeys = await redis.keys('kb:article:*');
    log(`   ✅ Found ${articleKeys.length} knowledge articles`, 'green');

    if (articleKeys.length > 0) {
      // Get first article as sample
      try {
        const sampleArticle = await redis.get(articleKeys[0]);
        if (sampleArticle) {
          // Handle case where article might already be an object
          const article = typeof sampleArticle === 'string' 
            ? JSON.parse(sampleArticle) 
            : sampleArticle;
          log(`   Sample article: "${article.title}"`, 'blue');
        }
      } catch (err: any) {
        log(`   ⚠️  Could not parse sample article: ${err.message}`, 'yellow');
      }
    } else {
      log('   ⚠️  No articles found. Run: npx tsx scripts/seed-redis.ts', 'yellow');
    }

    // Test 3: Check for tags
    const tagKeys = await redis.keys('kb:tag:*');
    log(`   ✅ Found ${tagKeys.length} tag indexes`, 'green');

    // Test 4: Test write/read
    log('   Testing read/write operations...', 'blue');
    const testKey = 'test:connection';
    const testValue = 'Connection test successful!';
    
    await redis.set(testKey, testValue, { ex: 60 }); // Expire in 60 seconds
    const readValue = await redis.get(testKey);
    
    if (readValue === testValue) {
      log('   ✅ Read/Write test successful', 'green');
      await redis.del(testKey); // Clean up
    } else {
      log('   ⚠️  Read/Write test failed', 'yellow');
    }

    log('\n✅ Redis connection: SUCCESS', 'green');
    return true;

  } catch (error: any) {
    log(`❌ Redis connection failed: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Main test function
 */
async function testConnections() {
  log('═══════════════════════════════════════════════', 'cyan');
  log('   🔌 DATABASE CONNECTION TEST', 'cyan');
  log('═══════════════════════════════════════════════', 'cyan');

  // Check if running from correct directory
  const cwd = process.cwd();
  if (!cwd.includes('my-turborepo')) {
    log('\n⚠️  Warning: Run this script from my-turborepo directory', 'yellow');
  }

  const postgresResult = await testPostgreSQL();
  const redisResult = await testRedis();

  // Summary
  log('\n═══════════════════════════════════════════════', 'cyan');
  log('   📋 CONNECTION TEST SUMMARY', 'cyan');
  log('═══════════════════════════════════════════════', 'cyan');
  
  log(`\n   PostgreSQL (Supabase): ${postgresResult ? '✅ CONNECTED' : '❌ FAILED'}`, 
    postgresResult ? 'green' : 'red');
  log(`   Redis (Upstash):        ${redisResult ? '✅ CONNECTED' : '❌ FAILED'}`, 
    redisResult ? 'green' : 'red');

  if (postgresResult && redisResult) {
    log('\n🎉 All database connections successful!', 'green');
    log('   Your application is ready to use both databases.', 'green');
  } else {
    log('\n⚠️  Some connections failed. Please check:', 'yellow');
    if (!postgresResult) {
      log('   - Verify SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env', 'yellow');
      log('   - Run schema.sql in Supabase SQL Editor', 'yellow');
    }
    if (!redisResult) {
      log('   - Verify REDIS_URL and REDIS_TOKEN in .env', 'yellow');
      log('   - Make sure you copied REST API credentials from Upstash', 'yellow');
    }
  }

  log('\n═══════════════════════════════════════════════\n', 'cyan');

  process.exit(postgresResult && redisResult ? 0 : 1);
}

// Run tests
testConnections().catch((error) => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  process.exit(1);
});

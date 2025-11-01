/**
 * Manual verification script for Live DB connection.
 * This script can be run directly to test the Redis connection.
 * 
 * Prerequisites:
 * - Set REDIS_URL and REDIS_TOKEN environment variables
 * 
 * Run with: npm run verify-connection
 */

import { healthCheck } from './healthCheck.js';
import { getRedisClient } from './redisClient.js';

async function verifyConnection() {
  console.log('🔍 Verifying Live DB Connection...\n');
  
  try {
    // Test 1: Health Check
    console.log('Test 1: Running health check...');
    const healthResult = await healthCheck();
    console.log(`Result: ${healthResult.success ? '✅' : '❌'}`);
    console.log(`Message: ${healthResult.message}`);
    console.log(`Timestamp: ${healthResult.timestamp}\n`);
    
    if (!healthResult.success) {
      process.exit(1);
    }
    
    // Test 2: Basic SET/GET operations
    console.log('Test 2: Testing SET/GET operations...');
    const redis = getRedisClient();
    const testKey = 'test:connection:verify';
    const testValue = 'Hello from Live DB!';
    
    await redis.set(testKey, testValue);
    console.log(`✅ SET operation successful`);
    
    const retrievedValue = await redis.get(testKey);
    console.log(`✅ GET operation successful`);
    console.log(`Retrieved value: ${retrievedValue}\n`);
    
    if (retrievedValue !== testValue) {
      console.log('❌ Value mismatch!');
      process.exit(1);
    }
    
    // Test 3: Delete operation
    console.log('Test 3: Testing DEL operation...');
    await redis.del(testKey);
    console.log(`✅ DEL operation successful\n`);
    
    const deletedValue = await redis.get(testKey);
    if (deletedValue !== null) {
      console.log('❌ Key was not properly deleted!');
      process.exit(1);
    }
    console.log(`✅ Key properly deleted\n`);
    
    console.log('🎉 All verification tests passed!');
    console.log('Live DB connection is working correctly.');
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  }
}

verifyConnection();

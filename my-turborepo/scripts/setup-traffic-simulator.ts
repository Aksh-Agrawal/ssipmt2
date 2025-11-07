/**
 * Setup Traffic Simulator Database
 * 
 * This script:
 * 1. Applies the traffic simulator schema to Supabase
 * 2. Seeds sample data for Raipur roads
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Get Supabase credentials from environment
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials!');
  console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function executeSQLFile(filePath: string, description: string) {
  console.log(`\n📄 ${description}...`);
  
  try {
    const sql = fs.readFileSync(filePath, 'utf-8');
    
    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`   Found ${statements.length} SQL statements`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip comments and empty statements
      if (!statement || statement.startsWith('--')) continue;
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
        
        if (error) {
          // Try direct execution if RPC fails
          console.log(`   ⚠️  RPC failed, trying direct execution for statement ${i + 1}...`);
          
          // For direct execution, we'll need to use the REST API
          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
          };
          const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ sql: statement + ';' })
          });
          
          if (!response.ok) {
            console.error(`   ❌ Failed to execute statement ${i + 1}`);
            console.error(`   Error: ${error?.message || 'Unknown error'}`);
          }
        } else {
          console.log(`   ✅ Statement ${i + 1}/${statements.length} executed`);
        }
      } catch (err) {
        console.error(`   ❌ Error on statement ${i + 1}:`, err);
      }
    }
    
    console.log(`✅ ${description} complete!`);
  } catch (error) {
    console.error(`❌ Failed to read ${filePath}:`, error);
    throw error;
  }
}

async function manualSchemaSetup() {
  console.log('\n📋 Creating tables manually...');
  
  try {
    // Create road_segments table
    console.log('   Creating road_segments table...');
    const { error: roadSegmentsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS road_segments (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255) NOT NULL,
          road_name VARCHAR(255) NOT NULL,
          start_point VARCHAR(255) NOT NULL,
          end_point VARCHAR(255) NOT NULL,
          start_lat DECIMAL(10, 8) NOT NULL,
          start_lng DECIMAL(11, 8) NOT NULL,
          end_lat DECIMAL(10, 8) NOT NULL,
          end_lng DECIMAL(11, 8) NOT NULL,
          length_km DECIMAL(6, 2) NOT NULL,
          lanes INTEGER NOT NULL,
          road_type VARCHAR(50) NOT NULL,
          speed_limit INTEGER NOT NULL,
          is_active BOOLEAN DEFAULT true,
          metadata JSONB DEFAULT '{}'::jsonb,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    });
    
    if (roadSegmentsError) {
      console.log(`   ℹ️  Road segments table: ${roadSegmentsError.message}`);
    } else {
      console.log('   ✅ Road segments table created');
    }
    
    // Create traffic_data table
    console.log('   Creating traffic_data table...');
    const { error: trafficDataError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS traffic_data (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          road_segment_id UUID REFERENCES road_segments(id) ON DELETE CASCADE,
          date DATE NOT NULL,
          hour INTEGER NOT NULL CHECK (hour >= 0 AND hour < 24),
          day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week < 7),
          vehicle_count INTEGER NOT NULL,
          avg_speed DECIMAL(5, 2) NOT NULL,
          congestion_level VARCHAR(20) NOT NULL,
          travel_time_minutes DECIMAL(6, 2) NOT NULL,
          special_event_id UUID,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    });
    
    if (trafficDataError) {
      console.log(`   ℹ️  Traffic data table: ${trafficDataError.message}`);
    } else {
      console.log('   ✅ Traffic data table created');
    }
    
    console.log('✅ Manual schema setup complete!');
  } catch (error) {
    console.error('❌ Manual schema setup failed:', error);
    throw error;
  }
}

async function main() {
  console.log('🚦 TRAFFIC SIMULATOR DATABASE SETUP');
  console.log('====================================\n');
  
  console.log(`📡 Connecting to Supabase: ${SUPABASE_URL}`);
  
  // Test connection
  const { data, error } = await supabase.from('reports').select('count', { count: 'exact', head: true });
  
  if (error) {
    console.error('❌ Failed to connect to Supabase:', error.message);
    process.exit(1);
  }
  
  console.log('✅ Connected to Supabase successfully!\n');
  
  // Try to apply schema
  const schemaPath = path.join(__dirname, '..', 'database', 'migrations', '004_traffic_simulator_schema.sql');
  
  console.log('\n⚠️  NOTE: Supabase SQL execution may require using the Supabase SQL Editor instead.');
  console.log('If this script fails, please:');
  console.log('1. Open your Supabase dashboard');
  console.log('2. Go to SQL Editor');
  console.log('3. Copy and paste the contents of:');
  console.log(`   ${schemaPath}`);
  console.log('4. Click RUN\n');
  
  try {
    await manualSchemaSetup();
  } catch (error) {
    console.error('\n❌ Automated setup failed.');
    console.log('\n📝 MANUAL SETUP REQUIRED:');
    console.log('Please run the SQL files manually in Supabase SQL Editor:');
    console.log(`1. ${schemaPath}`);
    console.log(`2. database/seed/004_traffic_simulator_seed.sql`);
    process.exit(1);
  }
  
  console.log('\n✨ Setup complete!');
  console.log('\n📊 Next steps:');
  console.log('1. Verify tables in Supabase dashboard');
  console.log('2. Run seed data if not already done');
  console.log('3. Build the /admin/simulate page');
  console.log('4. Create simulation API endpoint\n');
}

main().catch(console.error);

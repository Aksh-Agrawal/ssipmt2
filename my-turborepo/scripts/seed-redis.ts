/**
 * Redis Knowledge Base Seeding Script
 * 
 * This script seeds the Redis Live Database with example knowledge articles
 * for the AI Agent to use when answering citizen queries.
 * 
 * Usage:
 *   npx tsx scripts/seed-redis.ts
 * 
 * Prerequisites:
 *   - REDIS_URL and REDIS_TOKEN environment variables must be set
 *   - @upstash/redis package must be installed
 */

import { Redis } from '@upstash/redis';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables from apps/api/.env
function loadEnv() {
  try {
    const envPath = join(process.cwd(), 'apps', 'api', '.env');
    const envContent = readFileSync(envPath, 'utf-8');
    
    envContent.split('\n').forEach((line: string) => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        const value = valueParts.join('=').trim();
        if (key && value) {
          process.env[key.trim()] = value;
        }
      }
    });
    console.log('✅ Environment variables loaded from apps/api/.env\n');
  } catch (error: any) {
    console.error(`❌ Error: Could not load .env file: ${error.message}`);
    console.error('   Make sure you have apps/api/.env file with REDIS_URL and REDIS_TOKEN\n');
    process.exit(1);
  }
}

// Load environment variables at startup
loadEnv();

// Verify required environment variables
if (!process.env.REDIS_URL || !process.env.REDIS_TOKEN) {
  console.error('❌ Error: REDIS_URL or REDIS_TOKEN not found in environment variables');
  console.error('   Please check your apps/api/.env file\n');
  process.exit(1);
}

// Initialize Redis connection
const redis = new Redis({
  url: process.env.REDIS_URL!,
  token: process.env.REDIS_TOKEN!,
});

interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  tags: string[];
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Seeds a single knowledge article into Redis
 */
async function seedArticle(article: KnowledgeArticle): Promise<void> {
  // Store the article as a JSON string
  await redis.set(`kb:article:${article.id}`, JSON.stringify(article));
  
  // Add the article ID to each tag's set for fast lookups
  for (const tag of article.tags) {
    await redis.sadd(`kb:tag:${tag}`, article.id);
  }
  
  console.log(`✅ Added: ${article.title}`);
}

/**
 * Main seeding function
 */
async function seedKnowledgeBase() {
  console.log('🌱 Seeding Redis with knowledge articles...\n');

  try {
    // Test connection
    await redis.ping();
    console.log('✅ Redis connection successful\n');

    // Article 1: Garbage Collection Schedule
    await seedArticle({
      id: 'kb-001',
      title: 'Garbage Collection Schedule',
      content: 'Garbage collection happens every Monday, Wednesday, and Friday between 6 AM and 10 AM. Please place your bins outside before 6 AM on collection days. If your collection was missed, please report it through the app and our team will arrange a pickup within 24 hours.',
      tags: ['garbage', 'waste', 'schedule', 'collection', 'bins'],
      authorId: 'admin-001',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Article 2: Water Supply Timing
    await seedArticle({
      id: 'kb-002',
      title: 'Daily Water Supply Schedule',
      content: 'Municipal water supply is available from 5 AM to 9 AM and 5 PM to 9 PM daily. During summer months (April-June), there may be additional supply between 12 PM and 2 PM. Please store adequate water for your daily needs. In case of supply disruption, check our website or call 1916.',
      tags: ['water', 'supply', 'schedule', 'timing', 'utilities'],
      authorId: 'admin-001',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Article 3: Road Construction Updates
    await seedArticle({
      id: 'kb-003',
      title: 'Ongoing Road Construction - VIP Road',
      content: 'VIP Road is currently under construction from Ring Road to Pandri. Expected completion: December 2025. Alternative routes: Use G.E. Road or Vidhan Sabha Road. Construction hours: 7 AM to 7 PM on weekdays. Work is paused on Sundays. We apologize for any inconvenience.',
      tags: ['roads', 'construction', 'traffic', 'vip road', 'detour'],
      authorId: 'admin-001',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Article 4: Emergency Contact Numbers
    await seedArticle({
      id: 'kb-004',
      title: 'Emergency Contact Numbers',
      content: 'Important contacts - Municipal Emergency: 100, Fire Service: 101, Ambulance: 102, Police: 100, Water Supply Issues: 1916, Electricity Complaints: 1912, Road Maintenance: 1800-180-1551, Municipal Corporation: 0771-4019999. All emergency numbers are available 24/7.',
      tags: ['emergency', 'contact', 'help', 'phone', 'support'],
      authorId: 'admin-001',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Article 5: Property Tax Information
    await seedArticle({
      id: 'kb-005',
      title: 'Property Tax Payment Information',
      content: 'Property tax can be paid online at rmc.gov.in/tax or at any municipal office during business hours (10 AM - 5 PM, Monday-Friday). Annual payment deadline: March 31st. Early bird discount: 5% discount for payments before December 31st. Late payment penalty: 2% per month after deadline. For queries, call 0771-4019999.',
      tags: ['tax', 'property', 'payment', 'finance', 'deadline'],
      authorId: 'admin-001',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Article 6: Streetlight Repair Process
    await seedArticle({
      id: 'kb-006',
      title: 'How to Report Streetlight Issues',
      content: 'To report a broken or dim streetlight: 1) Note the pole number (printed on the pole), 2) Submit a report through this app with photo, 3) Our team will inspect within 48 hours, 4) Repairs typically completed within 5-7 working days. For urgent safety concerns, call 1912 immediately.',
      tags: ['streetlight', 'infrastructure', 'repair', 'electricity', 'safety'],
      authorId: 'admin-001',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Article 7: Park Maintenance Schedule
    await seedArticle({
      id: 'kb-007',
      title: 'Public Parks Maintenance Schedule',
      content: 'All municipal parks are cleaned daily between 6 AM - 8 AM. Major maintenance (trimming, painting, equipment repairs) happens on the first Sunday of each month. Parks may be partially closed during maintenance. Marine Drive Park, Buddha Talab, and Telibandha Lake have extended hours (5 AM - 9 PM).',
      tags: ['parks', 'maintenance', 'schedule', 'recreation', 'public spaces'],
      authorId: 'admin-001',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Article 8: Pothole Repair Timeline
    await seedArticle({
      id: 'kb-008',
      title: 'Pothole Repair Process and Timeline',
      content: 'When you report a pothole: 1) Verification within 24 hours, 2) Priority assessment (High/Medium/Low), 3) High priority: Fixed within 3 days, Medium: 7 days, Low: 15 days. During monsoon season, repairs may take longer due to weather conditions. Track your report status in the app.',
      tags: ['pothole', 'roads', 'repair', 'timeline', 'maintenance'],
      authorId: 'admin-001',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Article 9: Monsoon Preparedness
    await seedArticle({
      id: 'kb-009',
      title: 'Monsoon Season Services and Precautions',
      content: 'During monsoon (June-September): 1) Extra drainage cleaning teams deployed, 2) Emergency helpline 1800-180-1551 active 24/7, 3) Report waterlogging immediately, 4) Avoid low-lying areas during heavy rain, 5) Check weather alerts before traveling. Our teams conduct preventive drainage cleaning before monsoon starts.',
      tags: ['monsoon', 'weather', 'emergency', 'drainage', 'waterlogging', 'rain'],
      authorId: 'admin-001',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Article 10: Birth/Death Certificate Process
    await seedArticle({
      id: 'kb-010',
      title: 'Birth and Death Certificate Applications',
      content: 'Apply online at rmc.gov.in/certificates or visit your nearest municipal office. Required documents: Hospital records, ID proof of parents, address proof. Processing time: 7-10 working days for online, 15 days for offline. Fee: Rs 50 for normal processing, Rs 100 for urgent (3 days). Certificates are mandatory within 21 days of birth/death.',
      tags: ['certificate', 'birth', 'death', 'documents', 'registration', 'government'],
      authorId: 'admin-001',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    console.log('\n✨ Redis seeding complete!');
    console.log(`📊 Total articles seeded: 10`);
    
    // Display summary
    console.log('\n📋 Articles Summary:');
    console.log('  - Garbage Collection Schedule');
    console.log('  - Water Supply Schedule');
    console.log('  - Road Construction Updates');
    console.log('  - Emergency Contacts');
    console.log('  - Property Tax Information');
    console.log('  - Streetlight Repair Process');
    console.log('  - Parks Maintenance Schedule');
    console.log('  - Pothole Repair Timeline');
    console.log('  - Monsoon Preparedness');
    console.log('  - Birth/Death Certificate Process');

    // Test query
    console.log('\n🧪 Testing knowledge retrieval...');
    const garbageArticles = await redis.smembers('kb:tag:garbage');
    console.log(`   Found ${garbageArticles.length} articles with 'garbage' tag`);

  } catch (error) {
    console.error('❌ Error seeding Redis:', error);
    throw error;
  }
}

// Run the seeding function
seedKnowledgeBase()
  .then(() => {
    console.log('\n✅ Seeding script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Seeding script failed:', error);
    process.exit(1);
  });

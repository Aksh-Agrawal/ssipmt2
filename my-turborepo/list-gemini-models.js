#!/usr/bin/env node

/**
 * List available Gemini models
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

const envPath = require('path').join(__dirname, 'apps', 'web-platform', '.env.local');
const envContent = require('fs').readFileSync(envPath, 'utf8');
const apiKeyLine = envContent.split('\n').find(l => l.startsWith('GEMINI_API_KEY='));
const apiKey = apiKeyLine.split('=')[1]?.trim();

async function listModels() {
  const genAI = new GoogleGenerativeAI(apiKey);
  
  try {
    // Try to list models
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + apiKey);
    const data = await response.json();
    
    if (data.models) {
      console.log('\n✅ Available Gemini Models:\n');
      data.models.forEach(model => {
        if (model.supportedGenerationMethods?.includes('generateContent')) {
          console.log(`  📌 ${model.name.replace('models/', '')}`);
        }
      });
    } else {
      console.log('❌ Error:', data);
    }
  } catch (err) {
    console.error('❌ Failed to list models:', err.message);
  }
}

listModels();

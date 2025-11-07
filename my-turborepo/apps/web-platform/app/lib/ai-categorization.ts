import Groq from 'groq-sdk';

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

// Valid categories from the database schema
const VALID_CATEGORIES = [
  'Roads & Infrastructure',
  'Water Supply',
  'Electricity',
  'Garbage Collection',
  'Street Lights',
  'Drainage',
  'Public Transport',
  'Traffic Management',
  'Parks & Recreation',
  'Health & Sanitation',
  'Others',
] as const;

// Valid priorities
const VALID_PRIORITIES = ['Low', 'Medium', 'High', 'Critical'] as const;

export interface CategorizationResult {
  category: string;
  priority: string;
  confidence: number;
  reasoning?: string;
}

/**
 * Use Groq LLM to automatically categorize and prioritize a civic report
 * based on its description, location, and context.
 */
export async function categorizeReport(params: {
  description: string;
  location?: string;
  area?: string;
  language?: string;
}): Promise<CategorizationResult> {
  const { description, location, area, language = 'en' } = params;

  // Fallback if no API key
  if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === '') {
    return getFallbackCategorization(description);
  }

  try {
    const systemPrompt = `You are an AI assistant that categorizes civic issue reports for Raipur city government.

Your task: Analyze the report description and assign the most appropriate category and priority level.

**VALID CATEGORIES (choose EXACTLY one):**
- Roads & Infrastructure: Potholes, road damage, broken footpaths, manhole issues
- Water Supply: Water shortage, pipe leaks, contamination, supply timing issues
- Electricity: Power cuts, transformer issues, streetlight problems, meter issues
- Garbage Collection: Waste not collected, overflowing bins, missed pickups
- Street Lights: Non-functional lights, broken poles, dark areas
- Drainage: Blocked drains, waterlogging, sewage overflow
- Public Transport: Bus delays, route issues, stop maintenance
- Traffic Management: Signal issues, traffic congestion, parking problems
- Parks & Recreation: Park maintenance, playground issues, public spaces
- Health & Sanitation: Public toilets, cleanliness, pest control
- Others: Anything that doesn't fit above categories

**PRIORITY LEVELS (choose EXACTLY one):**
- Critical: Life-threatening, major safety hazard, severe impact (e.g., open manhole, major water contamination, live wire)
- High: Significant impact, urgent but not life-threatening (e.g., major road damage, power outage affecting many)
- Medium: Moderate impact, needs attention but not urgent (e.g., pothole, streetlight out, garbage delay)
- Low: Minor inconvenience, low impact (e.g., small footpath crack, park bench repair)

**PRIORITY FACTORS:**
- Safety risk: Higher priority for hazards
- Impact scale: More people affected = higher priority
- Urgency: Time-sensitive issues get higher priority
- Keywords: "emergency", "dangerous", "urgent", "many people" indicate higher priority

**RESPONSE FORMAT (JSON only):**
{
  "category": "exact category name from list above",
  "priority": "exact priority from list above",
  "confidence": 0.85,
  "reasoning": "brief explanation in 1-2 sentences"
}

**IMPORTANT:** 
- Respond ONLY with valid JSON
- Use EXACT category and priority names from the lists above
- Confidence should be 0.0 to 1.0
- Consider Raipur, India context (monsoon issues, hot climate, urban infrastructure)`;

    const userPrompt = `Categorize this civic report:

Description: "${description}"
${location ? `Location: ${location}` : ''}
${area ? `Area: ${area}` : ''}
${language ? `Language: ${language}` : ''}

Provide JSON response with category, priority, confidence, and reasoning.`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3, // Lower temperature for more consistent categorization
      max_tokens: 500,
      response_format: { type: 'json_object' },
    });

    const responseText = completion.choices[0]?.message?.content || '{}';
    const result = JSON.parse(responseText);

    // Validate and sanitize response
    const category = VALID_CATEGORIES.includes(result.category)
      ? result.category
      : 'Others';

    const priority = VALID_PRIORITIES.includes(result.priority)
      ? result.priority
      : 'Medium';

    return {
      category,
      priority,
      confidence: Math.min(Math.max(result.confidence || 0.7, 0), 1),
      reasoning: result.reasoning || 'Automatically categorized by AI',
    };
  } catch (error) {
    console.error('AI categorization error:', error);
    return getFallbackCategorization(description);
  }
}

/**
 * Fallback categorization using keyword matching
 * Used when Groq API is unavailable or fails
 */
function getFallbackCategorization(description: string): CategorizationResult {
  const lowerDesc = description.toLowerCase();

  // Keyword-based categorization
  const categoryRules: Array<{ keywords: string[]; category: string }> = [
    {
      keywords: ['pothole', 'road', 'crack', 'footpath', 'pavement', 'manhole', 'divider'],
      category: 'Roads & Infrastructure',
    },
    {
      keywords: ['water', 'pipe', 'leak', 'supply', 'tank', 'shortage', 'tap'],
      category: 'Water Supply',
    },
    {
      keywords: ['electricity', 'power', 'transformer', 'meter', 'connection', 'wire'],
      category: 'Electricity',
    },
    {
      keywords: ['garbage', 'waste', 'trash', 'bin', 'rubbish', 'collection'],
      category: 'Garbage Collection',
    },
    {
      keywords: ['street light', 'lamp', 'bulb', 'pole', 'lighting', 'dark'],
      category: 'Street Lights',
    },
    {
      keywords: ['drain', 'sewage', 'waterlog', 'overflow', 'blocked', 'clog'],
      category: 'Drainage',
    },
    {
      keywords: ['bus', 'transport', 'stop', 'route', 'auto', 'rickshaw'],
      category: 'Public Transport',
    },
    {
      keywords: ['traffic', 'signal', 'congestion', 'jam', 'parking', 'vehicle'],
      category: 'Traffic Management',
    },
    {
      keywords: ['park', 'garden', 'playground', 'bench', 'grass', 'tree'],
      category: 'Parks & Recreation',
    },
    {
      keywords: ['toilet', 'sanitation', 'cleanliness', 'pest', 'mosquito', 'hygiene'],
      category: 'Health & Sanitation',
    },
  ];

  let matchedCategory = 'Others';
  for (const rule of categoryRules) {
    if (rule.keywords.some((kw) => lowerDesc.includes(kw))) {
      matchedCategory = rule.category;
      break;
    }
  }

  // Priority based on keywords
  let priority: string = 'Medium';
  const criticalKeywords = [
    'emergency',
    'dangerous',
    'urgent',
    'critical',
    'life',
    'death',
    'accident',
    'open manhole',
    'live wire',
    'major',
  ];
  const highKeywords = ['broken', 'damaged', 'severe', 'many people', 'important'];
  const lowKeywords = ['minor', 'small', 'cosmetic', 'slight'];

  if (criticalKeywords.some((kw) => lowerDesc.includes(kw))) {
    priority = 'Critical';
  } else if (highKeywords.some((kw) => lowerDesc.includes(kw))) {
    priority = 'High';
  } else if (lowKeywords.some((kw) => lowerDesc.includes(kw))) {
    priority = 'Low';
  }

  return {
    category: matchedCategory,
    priority,
    confidence: 0.65, // Lower confidence for fallback
    reasoning: 'Categorized using keyword matching (AI unavailable)',
  };
}

/**
 * Extract urgency keywords from description
 */
export function extractUrgencyKeywords(description: string): string[] {
  const lowerDesc = description.toLowerCase();
  const urgencyKeywords = [
    'emergency',
    'urgent',
    'critical',
    'dangerous',
    'immediately',
    'asap',
    'life-threatening',
    'major',
    'severe',
  ];

  return urgencyKeywords.filter((kw) => lowerDesc.includes(kw));
}

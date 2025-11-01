/**
 * NLP Service
 * Handles natural language processing using Google Cloud Natural Language API
 */

export interface NLPResult {
  intent: string;
  entities: {
    location?: string;
  };
  keywords?: string[]; // Extracted keywords/tags for knowledge retrieval
  confidence?: number;
}

/**
 * Process a user query using Google Cloud Natural Language API
 * @param text - The user's natural language query
 * @returns Parsed intent and entities
 */
export async function processQuery(text: string): Promise<NLPResult> {
  const apiKey = process.env.GOOGLE_CLOUD_API_KEY;
  
  if (!apiKey) {
    console.warn('GOOGLE_CLOUD_API_KEY not configured');
    return {
      intent: 'unknown',
      entities: {},
    };
  }

  try {
    // Call Google Cloud Natural Language API - analyzeEntities
    const entitiesResponse = await fetch(
      `https://language.googleapis.com/v1/documents:analyzeEntities?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          document: {
            type: 'PLAIN_TEXT',
            content: text,
          },
          encodingType: 'UTF8',
        }),
      }
    );

    if (!entitiesResponse.ok) {
      const errorText = await entitiesResponse.text();
      console.error('Google NLP API error:', errorText);
      return {
        intent: 'unknown',
        entities: {},
      };
    }

    const entitiesData = await entitiesResponse.json() as GoogleNLPResponse;

    // Extract location entities
    const location = extractLocationEntity(entitiesData);

    // Extract keywords/tags from entities (nouns and proper nouns)
    const keywords = extractKeywords(entitiesData);

    // Determine intent based on keywords (simple implementation)
    const intent = determineIntent(text.toLowerCase());

    return {
      intent,
      entities: {
        ...(location && { location }),
      },
      keywords,
    };
  } catch (error) {
    console.error('Error processing query with NLP service:', error);
    return {
      intent: 'unknown',
      entities: {},
    };
  }
}

interface NLPEntity {
  name: string;
  type: string;
  metadata: Record<string, unknown>;
  salience: number;
}

interface GoogleNLPResponse {
  entities?: NLPEntity[];
}

/**
 * Extract location entities from Google NLP response
 */
function extractLocationEntity(nlpResponse: GoogleNLPResponse): string | undefined {
  if (!nlpResponse.entities || nlpResponse.entities.length === 0) {
    return undefined;
  }

  // Find the first location entity
  const locationEntity = nlpResponse.entities.find(
    (entity) => entity.type === 'LOCATION'
  );

  return locationEntity?.name;
}

/**
 * Extract keywords (tags) from Google NLP response
 * Extracts nouns and proper nouns that can be used as search tags
 */
function extractKeywords(nlpResponse: GoogleNLPResponse): string[] {
  if (!nlpResponse.entities || nlpResponse.entities.length === 0) {
    return [];
  }

  // Entity types to use as keywords: PERSON, LOCATION, ORGANIZATION, EVENT, WORK_OF_ART, CONSUMER_GOOD, OTHER
  const relevantTypes = [
    'PERSON',
    'LOCATION',
    'ORGANIZATION',
    'EVENT',
    'WORK_OF_ART',
    'CONSUMER_GOOD',
    'OTHER',
  ];

  // Extract entity names from relevant types, normalize to lowercase
  const keywords = nlpResponse.entities
    .filter((entity) => relevantTypes.includes(entity.type))
    .map((entity) => entity.name.toLowerCase().trim())
    .filter((name) => name.length > 0);

  // Remove duplicates
  return Array.from(new Set(keywords));
}

/**
 * Determine user intent based on keywords
 * Simple keyword-based approach for MVP
 */
function determineIntent(text: string): string {
  const trafficKeywords = [
    'traffic',
    'road',
    'blocked',
    'congestion',
    'route',
    'drive',
    'driving',
    'travel',
    'journey',
    'commute',
  ];

  const informationalKeywords = [
    'what',
    'when',
    'where',
    'who',
    'how',
    'tell me',
    'information',
    'about',
    'schedule',
    'hours',
    'contact',
    'phone',
    'email',
    'address',
  ];

  // Check if any traffic-related keywords are present
  const hasTrafficKeyword = trafficKeywords.some((keyword) =>
    text.includes(keyword)
  );

  if (hasTrafficKeyword) {
    return 'check_traffic';
  }

  // Check if any informational keywords are present
  const hasInformationalKeyword = informationalKeywords.some((keyword) =>
    text.includes(keyword)
  );

  if (hasInformationalKeyword) {
    return 'informational_query';
  }

  return 'unknown';
}

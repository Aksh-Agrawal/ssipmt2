import { LanguageServiceClient } from '@google-cloud/language';
import type { ReportCategory, ReportPriority } from '@repo/shared-types';

// NLP Service configuration
interface NLPConfig {
  apiKey: string;
}

// Analysis result interface
export interface AnalysisResult {
  category: ReportCategory;
  priority: ReportPriority;
  confidence: number;
}

/**
 * Maps NLP analysis results to our category and priority system
 */
class ReportAnalyzer {
  private nlpClient: LanguageServiceClient;

  constructor(config: NLPConfig) {
    this.nlpClient = new LanguageServiceClient({
      apiKey: config.apiKey,
    });
  }

  /**
   * Analyzes report description text to determine category and priority
   */
  async analyzeDescription(description: string): Promise<AnalysisResult> {
    try {
      // Analyze entities and sentiment using Google Cloud Natural Language
      const [entitiesResponse, sentimentResponse] = await Promise.all([
        this.nlpClient.analyzeEntities({
          document: {
            content: description,
            type: 'PLAIN_TEXT',
          },
        }),
        this.nlpClient.analyzeSentiment({
          document: {
            content: description,
            type: 'PLAIN_TEXT',
          },
        }),
      ]);

      const entities = entitiesResponse[0].entities || [];
      const sentiment = sentimentResponse[0].documentSentiment;

      // Map entities and keywords to categories
      const category = this.mapToCategory(description, entities);
      
      // Determine priority based on sentiment and urgency keywords
      const priority = this.mapToPriority(description, sentiment);

      return {
        category,
        priority,
        confidence: this.calculateConfidence(entities, sentiment),
      };
    } catch (error) {
      console.error('NLP analysis failed:', error);
      
      // Fallback to keyword-based analysis
      return this.fallbackAnalysis(description);
    }
  }

  /**
   * Maps NLP entities and keywords to report categories
   */
  private mapToCategory(description: string, entities: any[]): ReportCategory {
    const text = description.toLowerCase();
    
    // Extract entity names for category matching
    const entityNames = entities.map(entity => entity.name?.toLowerCase() || '');
    const allText = [text, ...entityNames].join(' ');

    // Category mapping based on keywords and entities
    if (this.containsKeywords(allText, ['pothole', 'road', 'pavement', 'asphalt', 'crater', 'hole in road'])) {
      return 'Pothole';
    }
    if (this.containsKeywords(allText, ['light', 'lighting', 'street light', 'lamp', 'illumination', 'dark'])) {
      return 'Street Lighting';
    }
    if (this.containsKeywords(allText, ['trash', 'garbage', 'waste', 'recycling', 'bin', 'collection', 'pickup'])) {
      return 'Waste Management';
    }
    if (this.containsKeywords(allText, ['water', 'sewer', 'leak', 'drain', 'pipe', 'flooding', 'sewage'])) {
      return 'Water/Sewer';
    }
    if (this.containsKeywords(allText, ['traffic', 'signal', 'light', 'intersection', 'crossing', 'stop light'])) {
      return 'Traffic Signal';
    }
    if (this.containsKeywords(allText, ['sidewalk', 'walkway', 'pavement', 'pedestrian', 'curb', 'steps'])) {
      return 'Sidewalk Repair';
    }
    if (this.containsKeywords(allText, ['noise', 'loud', 'sound', 'music', 'party', 'construction', 'disturbance'])) {
      return 'Noise Complaint';
    }
    if (this.containsKeywords(allText, ['graffiti', 'vandalism', 'spray paint', 'tagging', 'defaced'])) {
      return 'Graffiti';
    }
    if (this.containsKeywords(allText, ['park', 'playground', 'recreation', 'green space', 'garden', 'sports'])) {
      return 'Parks/Recreation';
    }

    return 'Other';
  }

  /**
   * Maps sentiment and urgency keywords to priority levels
   */
  private mapToPriority(description: string, sentiment: any): ReportPriority {
    const text = description.toLowerCase();
    
    // High priority indicators
    if (this.containsKeywords(text, [
      'urgent', 'emergency', 'dangerous', 'safety', 'hazard', 'immediate',
      'accident', 'injured', 'broken', 'severe', 'critical', 'unsafe'
    ])) {
      return 'High';
    }

    // Check sentiment magnitude and score for priority
    const sentimentScore = sentiment?.score || 0;
    const sentimentMagnitude = sentiment?.magnitude || 0;

    // Very negative sentiment with high magnitude indicates urgency
    if (sentimentScore < -0.5 && sentimentMagnitude > 0.8) {
      return 'High';
    }

    // Medium priority indicators
    if (this.containsKeywords(text, [
      'problem', 'issue', 'concern', 'needs attention', 'repair', 'fix',
      'maintenance', 'damaged', 'not working', 'broken'
    ])) {
      return 'Medium';
    }

    // Moderate negative sentiment
    if (sentimentScore < -0.2 && sentimentMagnitude > 0.5) {
      return 'Medium';
    }

    return 'Low';
  }

  /**
   * Calculates confidence score based on entity recognition and sentiment analysis
   */
  private calculateConfidence(entities: any[], sentiment: any): number {
    const entityConfidence = entities.length > 0 ? 
      entities.reduce((sum, entity) => sum + (entity.salience || 0), 0) / entities.length : 0;
    
    const sentimentConfidence = sentiment?.magnitude || 0;
    
    return Math.min((entityConfidence + sentimentConfidence) / 2, 1.0);
  }

  /**
   * Helper method to check if text contains any of the specified keywords
   */
  private containsKeywords(text: string, keywords: string[]): boolean {
    return keywords.some(keyword => text.includes(keyword));
  }

  /**
   * Fallback analysis when NLP service fails
   */
  private fallbackAnalysis(description: string): AnalysisResult {
    const category = this.mapToCategory(description, []);
    const priority = this.mapToPriority(description, { score: 0, magnitude: 0 });
    
    return {
      category,
      priority,
      confidence: 0.5, // Lower confidence for fallback
    };
  }
}

export { ReportAnalyzer };
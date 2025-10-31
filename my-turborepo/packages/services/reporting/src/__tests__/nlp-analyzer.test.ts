import { ReportAnalyzer } from '../nlp-analyzer';
import type { ReportCategory, ReportPriority } from '@repo/shared-types';

// Mock Google Cloud Language client
jest.mock('@google-cloud/language', () => ({
  LanguageServiceClient: jest.fn().mockImplementation(() => ({
    analyzeEntities: jest.fn(),
    analyzeSentiment: jest.fn(),
  })),
}));

describe('ReportAnalyzer', () => {
  let analyzer: ReportAnalyzer;
  let mockNLPClient: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create analyzer instance
    analyzer = new ReportAnalyzer({ apiKey: 'test-api-key' });
    
    // Get mock client instance
    const { LanguageServiceClient } = require('@google-cloud/language');
    mockNLPClient = new LanguageServiceClient();
  });

  describe('Category Mapping', () => {
    it('should classify pothole reports correctly', async () => {
      // Mock NLP responses
      mockNLPClient.analyzeEntities.mockResolvedValue([{
        entities: [
          { name: 'road', salience: 0.8 },
          { name: 'pothole', salience: 0.9 }
        ]
      }]);
      
      mockNLPClient.analyzeSentiment.mockResolvedValue([{
        documentSentiment: { score: -0.3, magnitude: 0.6 }
      }]);

      const result = await analyzer.analyzeDescription(
        'There is a huge pothole on Main Street causing damage to cars'
      );

      expect(result.category).toBe('Pothole');
      expect(result.priority).toBe('Medium');
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('should classify street lighting issues correctly', async () => {
      mockNLPClient.analyzeEntities.mockResolvedValue([{
        entities: [
          { name: 'street light', salience: 0.9 },
          { name: 'dark', salience: 0.7 }
        ]
      }]);
      
      mockNLPClient.analyzeSentiment.mockResolvedValue([{
        documentSentiment: { score: -0.5, magnitude: 0.8 }
      }]);

      const result = await analyzer.analyzeDescription(
        'The street light on Oak Avenue is not working and it is very dark at night'
      );

      expect(result.category).toBe('Street Lighting');
      expect(result.priority).toBe('Medium');
    });

    it('should classify waste management issues correctly', async () => {
      mockNLPClient.analyzeEntities.mockResolvedValue([{
        entities: [
          { name: 'garbage', salience: 0.8 },
          { name: 'collection', salience: 0.6 }
        ]
      }]);
      
      mockNLPClient.analyzeSentiment.mockResolvedValue([{
        documentSentiment: { score: -0.2, magnitude: 0.4 }
      }]);

      const result = await analyzer.analyzeDescription(
        'Garbage bins have not been collected for two weeks on Elm Street'
      );

      expect(result.category).toBe('Waste Management');
      expect(result.priority).toBe('Low');
    });

    it('should default to Other category for unclear descriptions', async () => {
      mockNLPClient.analyzeEntities.mockResolvedValue([{
        entities: [
          { name: 'something', salience: 0.3 }
        ]
      }]);
      
      mockNLPClient.analyzeSentiment.mockResolvedValue([{
        documentSentiment: { score: 0.1, magnitude: 0.2 }
      }]);

      const result = await analyzer.analyzeDescription(
        'Something is happening on the street'
      );

      expect(result.category).toBe('Other');
    });
  });

  describe('Priority Mapping', () => {
    it('should assign High priority for urgent/dangerous issues', async () => {
      mockNLPClient.analyzeEntities.mockResolvedValue([{
        entities: [{ name: 'danger', salience: 0.9 }]
      }]);
      
      mockNLPClient.analyzeSentiment.mockResolvedValue([{
        documentSentiment: { score: -0.8, magnitude: 1.0 }
      }]);

      const result = await analyzer.analyzeDescription(
        'URGENT: Dangerous pothole causing accidents on highway'
      );

      expect(result.priority).toBe('High');
    });

    it('should assign Medium priority for problems needing attention', async () => {
      mockNLPClient.analyzeEntities.mockResolvedValue([{
        entities: [{ name: 'problem', salience: 0.7 }]
      }]);
      
      mockNLPClient.analyzeSentiment.mockResolvedValue([{
        documentSentiment: { score: -0.3, magnitude: 0.6 }
      }]);

      const result = await analyzer.analyzeDescription(
        'There is a problem with the street light that needs repair'
      );

      expect(result.priority).toBe('Medium');
    });

    it('should assign Low priority for minor issues', async () => {
      mockNLPClient.analyzeEntities.mockResolvedValue([{
        entities: [{ name: 'issue', salience: 0.4 }]
      }]);
      
      mockNLPClient.analyzeSentiment.mockResolvedValue([{
        documentSentiment: { score: -0.1, magnitude: 0.3 }
      }]);

      const result = await analyzer.analyzeDescription(
        'Small cosmetic issue with park bench'
      );

      expect(result.priority).toBe('Low');
    });
  });

  describe('Error Handling', () => {
    it('should fallback to keyword analysis when NLP fails', async () => {
      // Mock NLP failure
      mockNLPClient.analyzeEntities.mockRejectedValue(new Error('API Error'));
      mockNLPClient.analyzeSentiment.mockRejectedValue(new Error('API Error'));

      const result = await analyzer.analyzeDescription(
        'There is a dangerous pothole on Main Street'
      );

      expect(result.category).toBe('Pothole'); // Should still work with keywords
      expect(result.priority).toBe('High'); // Should detect "dangerous"
      expect(result.confidence).toBe(0.5); // Lower confidence for fallback
    });

    it('should handle empty descriptions gracefully', async () => {
      mockNLPClient.analyzeEntities.mockResolvedValue([{ entities: [] }]);
      mockNLPClient.analyzeSentiment.mockResolvedValue([{
        documentSentiment: { score: 0, magnitude: 0 }
      }]);

      const result = await analyzer.analyzeDescription('');

      expect(result.category).toBe('Other');
      expect(result.priority).toBe('Low');
      expect(typeof result.confidence).toBe('number');
    });
  });
});
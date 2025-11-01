import {
  processQuery,
  formatTrafficResponse,
  formatNoLocationResponse,
  formatUnknownIntentResponse,
} from './index.js';

describe('Agent Service Exports', () => {
  describe('processQuery', () => {
    it('should process a query and return NLP result', async () => {
      const query = 'How is traffic to downtown?';
      const result = await processQuery(query);
      
      expect(result).toHaveProperty('intent');
      expect(result).toHaveProperty('entities');
    });
  });

  describe('formatTrafficResponse', () => {
    it('should format traffic data into natural language', () => {
      const trafficData = {
        origin: 'current location',
        destination: 'downtown',
        durationSeconds: 900,
        durationText: '15 mins',
        distanceMeters: 5000,
        distanceText: '5.0 km',
        trafficCondition: 'MODERATE',
      };
      
      const response = formatTrafficResponse(trafficData);
      
      expect(response).toContain('downtown');
      expect(response).toContain('moderate');
      expect(response).toContain('15 mins');
    });
  });

  describe('formatNoLocationResponse', () => {
    it('should return a helpful message asking for location', () => {
      const response = formatNoLocationResponse();
      
      expect(response).toContain('destination');
      expect(response.length).toBeGreaterThan(0);
    });
  });

  describe('formatUnknownIntentResponse', () => {
    it('should return a helpful message for unknown queries', () => {
      const response = formatUnknownIntentResponse('What is the weather?');
      
      expect(response).toContain('traffic');
      expect(response.length).toBeGreaterThan(0);
    });
  });
});

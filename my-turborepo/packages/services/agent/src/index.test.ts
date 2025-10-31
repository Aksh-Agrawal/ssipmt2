import { agentService } from './index.js';

describe('agentService', () => {
  describe('processQuery', () => {
    it('should process a query and return a response', async () => {
      const query = 'What is the traffic like?';
      const response = await agentService.processQuery(query);
      
      expect(response).toContain(query);
    });
  });

  describe('getTrafficInfo', () => {
    it('should return traffic information for a location', async () => {
      const location = 'Main Street';
      const result = await agentService.getTrafficInfo(location);
      
      expect(result).toContain(location);
    });
  });
});

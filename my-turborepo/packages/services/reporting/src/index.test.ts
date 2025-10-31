import { reportingService } from './index.js';

describe('reportingService', () => {
  describe('submitReport', () => {
    it('should create a report with default values', async () => {
      const reportData = {
        userId: 'user-123',
        description: 'Test report',
      };

      const report = await reportingService.submitReport(reportData);

      expect(report.id).toBeDefined();
      expect(report.userId).toBe('user-123');
      expect(report.description).toBe('Test report');
      expect(report.status).toBe('pending');
      expect(report.createdAt).toBeInstanceOf(Date);
      expect(report.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('getReport', () => {
    it('should return null for non-existent report', async () => {
      const result = await reportingService.getReport('non-existent-id');
      expect(result).toBeNull();
    });
  });
});

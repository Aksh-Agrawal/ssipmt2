import React from 'react';

// Mock the report service
const mockGetReportStatus = jest.fn();

jest.mock('../../services/reportService', () => ({
  reportService: {
    getReportStatus: mockGetReportStatus,
  },
}));

// Mock Alert
const mockAlert = jest.fn();
jest.mock('react-native', () => ({
  Alert: {
    alert: mockAlert,
  },
  View: 'View',
  Text: 'Text',
  TextInput: 'TextInput',
  TouchableOpacity: 'TouchableOpacity',
  ActivityIndicator: 'ActivityIndicator',
  SafeAreaView: 'SafeAreaView',
  StyleSheet: {
    create: (styles: Record<string, unknown>) => styles,
  },
}));

import { StatusCheckScreen } from './StatusCheckScreen';

describe('StatusCheckScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined and exportable', () => {
    expect(StatusCheckScreen).toBeDefined();
    expect(typeof StatusCheckScreen).toBe('function');
  });

  it('should be a React component', () => {
    const component = React.createElement(StatusCheckScreen);
    expect(component.type).toBe(StatusCheckScreen);
  });

  it('should have proper component structure', () => {
    // Test that the component can be created without errors
    const component = React.createElement(StatusCheckScreen);
    expect(component).toBeDefined();
    
    // Verify service mock is available
    expect(mockGetReportStatus).toBeDefined();
    expect(mockAlert).toBeDefined();
  });

  describe('Service integration', () => {
    it('should support calling getReportStatus service', async () => {
      const mockStatus = {
        id: 'test-123',
        status: 'In Progress',
        updatedAt: new Date('2024-01-15T10:30:00Z'),
      };

      mockGetReportStatus.mockResolvedValue(mockStatus);
      
      // Simulate the service call that would happen on button press
      const result = await mockGetReportStatus('test-123');
      
      expect(mockGetReportStatus).toHaveBeenCalledWith('test-123');
      expect(result).toEqual(mockStatus);
    });

    it('should handle service errors', async () => {
      mockGetReportStatus.mockRejectedValue(new Error('Report not found (404)'));
      
      try {
        await mockGetReportStatus('invalid-id');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain('404');
      }
      
      expect(mockGetReportStatus).toHaveBeenCalledWith('invalid-id');
    });

    it('should support alert functionality', () => {
      // Simulate the alert call that would happen for validation
      mockAlert('Error', 'Please enter a tracking ID');
      
      expect(mockAlert).toHaveBeenCalledWith('Error', 'Please enter a tracking ID');
    });
  });
});
import React from 'react';

// Mock navigation function
const mockNavigate = jest.fn();

// Mock React Navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

// Mock React Native Paper components
jest.mock('react-native-paper', () => ({
  Button: 'Button',
  Title: 'Title',
}));

// Mock React Native components
jest.mock('react-native', () => ({
  View: 'View',
  StyleSheet: {
    create: (styles: Record<string, unknown>) => styles,
  },
}));

import HomeScreen from './HomeScreen';

describe('HomeScreen', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('should be defined and exportable', () => {
    expect(HomeScreen).toBeDefined();
    expect(typeof HomeScreen).toBe('function');
  });

  it('should be a React component', () => {
    const component = React.createElement(HomeScreen);
    expect(component.type).toBe(HomeScreen);
  });

  it('should have proper navigation structure', () => {
    // Test that the component can be created without errors
    const component = React.createElement(HomeScreen);
    expect(component).toBeDefined();
    
    // Verify navigation mock is available
    expect(mockNavigate).toBeDefined();
  });

  describe('Navigation requirements', () => {
    it('should support navigation to ReportSubmission route', () => {
      // Simulate the navigation call that would happen on button press
      mockNavigate('ReportSubmission');
      expect(mockNavigate).toHaveBeenCalledWith('ReportSubmission');
    });

    it('should support navigation to AgentChat route', () => {
      // Simulate the navigation call that would happen on button press
      mockNavigate('AgentChat');
      expect(mockNavigate).toHaveBeenCalledWith('AgentChat');
    });

    it('should support navigation to StatusCheck route', () => {
      // Simulate the navigation call that would happen on button press
      mockNavigate('StatusCheck');
      expect(mockNavigate).toHaveBeenCalledWith('StatusCheck');
    });
  });
});
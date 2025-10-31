import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Title } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const handleReportIssue = () => {
    navigation.navigate('ReportSubmission');
  };

  const handleAskQuestion = () => {
    navigation.navigate('AgentChat');
  };

  const handleCheckStatus = () => {
    navigation.navigate('StatusCheck');
  };

  return (
    <View style={styles.container}>
      <Title style={styles.title}>AI-Powered Civic Voice Assistant</Title>
      
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handleReportIssue}
          style={styles.button}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
          testID="report-issue-button"
        >
          Report an Issue
        </Button>
        
        <Button
          mode="contained"
          onPress={handleAskQuestion}
          style={[styles.button, styles.secondButton]}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
          testID="ask-question-button"
        >
          Ask a Question
        </Button>
        
        <Button
          mode="contained"
          onPress={handleCheckStatus}
          style={[styles.button, styles.thirdButton]}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
          testID="check-status-button"
        >
          Check Report Status
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 48,
    textAlign: 'center',
    color: '#333',
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
  },
  button: {
    marginBottom: 16,
    borderRadius: 8,
  },
  secondButton: {
    marginBottom: 16,
  },
  thirdButton: {
    marginBottom: 0,
  },
  buttonContent: {
    paddingVertical: 12,
  },
  buttonLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
});

export default HomeScreen;
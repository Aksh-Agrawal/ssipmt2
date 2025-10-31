import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Title, Paragraph } from 'react-native-paper';

const ReportSubmissionScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Title style={styles.title}>Report Submission</Title>
      <Paragraph style={styles.description}>
        This screen will allow users to submit reports about civic issues.
        Coming soon in future stories.
      </Paragraph>
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
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    lineHeight: 24,
  },
});

export default ReportSubmissionScreen;
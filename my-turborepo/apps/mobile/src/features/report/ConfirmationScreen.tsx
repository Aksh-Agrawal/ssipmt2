import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Title, Paragraph, Button, Card } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Confirmation'>;

const ConfirmationScreen: React.FC<Props> = ({ route, navigation }) => {
  const { trackingId } = route.params;

  const handleDone = () => {
    // Reset navigation stack and return to home
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.successIcon}>
            <Title style={styles.successEmoji}>✅</Title>
          </View>
          
          <Title style={styles.title}>Report Submitted!</Title>
          
          <Paragraph style={styles.message}>
            Thank you for reporting this issue. Your report has been successfully submitted and will be reviewed by our team.
          </Paragraph>

          <View style={styles.trackingSection}>
            <Paragraph style={styles.trackingLabel}>
              Your Tracking ID:
            </Paragraph>
            <Card style={styles.trackingCard}>
              <Card.Content>
                <Paragraph style={styles.trackingId} selectable>
                  {trackingId}
                </Paragraph>
              </Card.Content>
            </Card>
            <Paragraph style={styles.trackingNote}>
              Save this ID to check the status of your report later.
            </Paragraph>
          </View>

          <Button
            mode="contained"
            onPress={handleDone}
            style={styles.doneButton}
            contentStyle={styles.doneButtonContent}
          >
            Done
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
  },
  card: {
    elevation: 4,
    backgroundColor: '#ffffff',
  },
  cardContent: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  successIcon: {
    marginBottom: 16,
  },
  successEmoji: {
    fontSize: 48,
    textAlign: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  trackingSection: {
    width: '100%',
    marginBottom: 32,
  },
  trackingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  trackingCard: {
    backgroundColor: '#f8f9fa',
    marginBottom: 8,
  },
  trackingId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976d2',
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  trackingNote: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  doneButton: {
    width: '100%',
    marginTop: 16,
  },
  doneButtonContent: {
    paddingVertical: 8,
  },
});

export default ConfirmationScreen;
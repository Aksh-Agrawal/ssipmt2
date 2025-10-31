import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { reportService } from '../../services/reportService';

interface ReportStatus {
  id: string;
  status: string;
  updatedAt: Date;
}

export const StatusCheckScreen: React.FC = () => {
  const [trackingId, setTrackingId] = useState('');
  const [reportStatus, setReportStatus] = useState<ReportStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckStatus = async () => {
    if (!trackingId.trim()) {
      Alert.alert('Error', 'Please enter a tracking ID');
      return;
    }

    setLoading(true);
    setError(null);
    setReportStatus(null);

    try {
      const status = await reportService.getReportStatus(trackingId.trim());
      setReportStatus(status);
    } catch (err) {
      if (err instanceof Error && err.message.includes('404')) {
        setError('Report not found. Please check your tracking ID.');
      } else {
        setError('Unable to check report status. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'submitted':
        return '#FFA500'; // Orange
      case 'in progress':
        return '#0066CC'; // Blue
      case 'resolved':
        return '#00AA00'; // Green
      case 'closed':
        return '#666666'; // Gray
      default:
        return '#333333'; // Default
    }
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Check Report Status</Text>
        <Text style={styles.subtitle}>
          Enter your tracking ID to check the status of your report
        </Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Tracking ID</Text>
          <TextInput
            style={styles.input}
            value={trackingId}
            onChangeText={setTrackingId}
            placeholder="Enter your tracking ID"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleCheckStatus}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" testID="loading-indicator" />
          ) : (
            <Text style={styles.buttonText}>Check Status</Text>
          )}
        </TouchableOpacity>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {reportStatus && (
          <View style={styles.statusContainer}>
            <Text style={styles.statusTitle}>Report Status</Text>
            
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Tracking ID:</Text>
              <Text style={styles.statusValue}>{reportStatus.id}</Text>
            </View>

            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Status:</Text>
              <Text style={[
                styles.statusValue,
                styles.statusBadge,
                { backgroundColor: getStatusColor(reportStatus.status) }
              ]}>
                {reportStatus.status}
              </Text>
            </View>

            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Last Updated:</Text>
              <Text style={styles.statusValue}>
                {formatDate(reportStatus.updatedAt)}
              </Text>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#333333',
  },
  button: {
    backgroundColor: '#0066CC',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#FFE6E6',
    borderColor: '#FF6B6B',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  errorText: {
    color: '#CC0000',
    fontSize: 14,
    textAlign: 'center',
  },
  statusContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 20,
    borderWidth: 1,
    borderColor: '#DDDDDD',
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
    textAlign: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  statusLabel: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
    flex: 1,
  },
  statusValue: {
    fontSize: 14,
    color: '#333333',
    flex: 2,
    textAlign: 'right',
  },
  statusBadge: {
    color: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    overflow: 'hidden',
  },
});
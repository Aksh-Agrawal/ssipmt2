import type { Report } from '@repo/shared-types';

export interface ReportSubmissionData {
  description: string;
  photoUri?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface ReportSubmissionResponse {
  trackingId: string;
  message: string;
}

class ReportService {
  private baseUrl = 'http://localhost:3000'; // Will be configurable in production

  async submitReport(data: ReportSubmissionData): Promise<ReportSubmissionResponse> {
    try {
      // Step 1: Upload photo to storage if provided
      let photoUrl: string | undefined;
      if (data.photoUri) {
        photoUrl = await this.uploadPhoto(data.photoUri);
      }

      // Step 2: Submit report data to API
      const payload = {
        description: data.description,
        photoUrl,
        location: data.location,
      };

      const response = await fetch(`${this.baseUrl}/api/v1/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result: ReportSubmissionResponse = await response.json();
      return result;
    } catch (error) {
      console.error('Report submission failed:', error);
      throw error;
    }
  }

  private async uploadPhoto(photoUri: string): Promise<string> {
    // TODO: Implement photo upload to Supabase Storage
    // For now, simulate upload and return a mock URL
    console.log('Uploading photo:', photoUri);
    
    // Simulate upload delay
    await new Promise<void>(resolve => setTimeout(() => resolve(), 1000));
    
    // Return mock URL for development
    return `https://storage.example.com/photos/${Date.now()}.jpg`;
  }
}

export const reportService = new ReportService();
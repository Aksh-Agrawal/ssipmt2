import type { Report } from '@repo/shared-types';
import { reportRepository } from './repository';

export interface SubmitReportInput {
  description: string;
  photoUrl?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

// Core business logic for report submission
export async function submitReport(input: SubmitReportInput): Promise<Report> {
  // Generate tracking ID
  const trackingId = crypto.randomUUID();
  
  // Prepare report data
  const reportData: Omit<Report, 'id'> = {
    userId: '', // Will be populated when auth is implemented
    description: input.description,
    status: 'pending',
    location: input.location,
    photoUrls: input.photoUrl ? [input.photoUrl] : [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Save to database through repository pattern
  const savedReport = await reportRepository.create(trackingId, reportData);
  
  return savedReport;
}

export const reportingService = {
  async submitReport(reportData: Partial<Report>): Promise<Report> {
    // Placeholder implementation
    const report: Report = {
      id: crypto.randomUUID(),
      userId: reportData.userId || '',
      description: reportData.description || '',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...reportData,
    };
    return report;
  },

  async getReport(id: string): Promise<Report | null> {
    // Placeholder implementation
    console.log(`Getting report: ${id}`);
    return null;
  },
};

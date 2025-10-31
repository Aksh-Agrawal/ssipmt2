import type { Report, ReportCategory, ReportPriority } from '@repo/shared-types';
import { reportRepository } from './repository';
import { ReportAnalyzer } from './nlp-analyzer';
import { reportingConfig } from './config';

// Export repository for admin API use
export { reportRepository };

export interface SubmitReportInput {
  description: string;
  photoUrl?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface AnalyzeReportInput {
  reportId: string;
  description: string;
}

export interface AnalyzeReportResult {
  category: ReportCategory;
  priority: ReportPriority;
  confidence: number;
}

// Initialize NLP analyzer
let nlpAnalyzer: ReportAnalyzer | null = null;

function getNLPAnalyzer(): ReportAnalyzer {
  if (!nlpAnalyzer) {
    nlpAnalyzer = new ReportAnalyzer({
      apiKey: reportingConfig.googleCloud.apiKey,
    });
  }
  return nlpAnalyzer;
}

// Core business logic for report submission
export async function submitReport(input: SubmitReportInput): Promise<Report> {
  // Generate tracking ID
  const trackingId = crypto.randomUUID();
  
  // Prepare report data
  const reportData: Omit<Report, 'id'> = {
    userId: '', // Will be populated when auth is implemented
    description: input.description,
    status: 'Submitted',
    location: input.location,
    photoUrls: input.photoUrl ? [input.photoUrl] : [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Save to database through repository pattern
  const savedReport = await reportRepository.create(trackingId, reportData);
  
  return savedReport;
}

/**
 * Analyzes report content using NLP and updates the database
 * This function is called by the internal analyze-report API endpoint
 */
export async function analyzeReportContent(input: AnalyzeReportInput): Promise<AnalyzeReportResult> {
  try {
    // Verify the report exists
    const existingReport = await reportRepository.findById(input.reportId);
    if (!existingReport) {
      throw new Error(`Report with ID ${input.reportId} not found`);
    }

    // Check if already analyzed to avoid re-processing
    if (existingReport.category && existingReport.priority) {
      console.log(`Report ${input.reportId} already analyzed`);
      return {
        category: existingReport.category,
        priority: existingReport.priority,
        confidence: 1.0, // Existing analysis
      };
    }

    // Perform NLP analysis
    const analyzer = getNLPAnalyzer();
    const analysisResult = await analyzer.analyzeDescription(input.description);

    // Update the report in the database
    await reportRepository.updateCategoryAndPriority(
      input.reportId,
      analysisResult.category,
      analysisResult.priority
    );

    console.log(`Report ${input.reportId} analyzed: ${analysisResult.category} (${analysisResult.priority} priority)`);

    return analysisResult;
  } catch (error) {
    console.error(`Failed to analyze report ${input.reportId}:`, error);
    throw error;
  }
}

export const reportingService = {
  async submitReport(reportData: Partial<Report>): Promise<Report> {
    // Placeholder implementation
    const report: Report = {
      id: crypto.randomUUID(),
      userId: reportData.userId || '',
      description: reportData.description || '',
      status: 'Submitted',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...reportData,
    };
    return report;
  },

  async getReport(id: string): Promise<Report | null> {
    return await reportRepository.findById(id);
  },
};

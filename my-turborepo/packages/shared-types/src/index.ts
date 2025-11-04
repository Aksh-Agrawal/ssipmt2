// Shared TypeScript types for the AI-Powered Civic Voice Assistant

// Report categories based on common civic issues
export type ReportCategory = 
  | 'Pothole'
  | 'Street Lighting'
  | 'Waste Management'
  | 'Water/Sewer'
  | 'Traffic Signal'
  | 'Sidewalk Repair'
  | 'Noise Complaint'
  | 'Graffiti'
  | 'Parks/Recreation'
  | 'Other';

// Report priority levels matching database enum
export type ReportPriority = 'Low' | 'Medium' | 'High';

// Report status matching database enum
export type ReportStatus = 'Submitted' | 'In Progress' | 'Resolved' | 'Rejected';

export interface Report {
  id: string;
  userId: string;
  description: string;
  category?: ReportCategory;
  priority?: ReportPriority;
  status: ReportStatus;
  location?: {
    latitude: number;
    longitude: number;
  };
  photoUrls?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'moderator';
  createdAt: Date;
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Agent query response with optional sources
export interface AgentQuerySource {
  id: string;
  title: string;
  url?: string;
}

export interface AgentQueryResponse {
  response: string;
  sources?: AgentQuerySource[];
}

// Shared TypeScript types for the AI-Powered Civic Voice Assistant

export interface Report {
  id: string;
  userId: string;
  description: string;
  category?: string;
  priority?: number;
  status: 'pending' | 'in-progress' | 'resolved' | 'closed';
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

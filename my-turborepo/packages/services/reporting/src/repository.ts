import type { Report, ReportCategory, ReportPriority } from '@repo/shared-types';
import { createClient } from '@supabase/supabase-js';
import { reportingConfig } from './config';

// Initialize Supabase client with service role key for backend operations
const supabase = createClient(
  reportingConfig.supabase.url,
  reportingConfig.supabase.serviceKey
);

// Repository pattern for data access abstraction
export const reportRepository = {
  async create(id: string, reportData: Omit<Report, 'id'>): Promise<Report> {
    const { data, error } = await supabase
      .from('reports')
      .insert({
        id,
        description: reportData.description,
        photo_url: reportData.photoUrls?.[0] || null,
        location: reportData.location ? 
          `POINT(${reportData.location.longitude} ${reportData.location.latitude})` : null,
        status: reportData.status,
        category: reportData.category,
        priority: reportData.priority,
        citizen_id: reportData.userId,
        created_at: reportData.createdAt.toISOString(),
        updated_at: reportData.updatedAt.toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create report: ${error.message}`);
    }

    return this.mapDbToReport(data);
  },

  async findById(id: string): Promise<Report | null> {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to find report: ${error.message}`);
    }

    return this.mapDbToReport(data);
  },

  async updateCategoryAndPriority(
    id: string, 
    category: ReportCategory, 
    priority: ReportPriority
  ): Promise<void> {
    const { error } = await supabase
      .from('reports')
      .update({
        category,
        priority,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to update report ${id}: ${error.message}`);
    }
  },

  async findAll(): Promise<Report[]> {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch reports: ${error.message}`);
    }

    return data.map(this.mapDbToReport);
  },

  // Maps database row to Report interface
  mapDbToReport(dbRow: any): Report {
    return {
      id: dbRow.id,
      userId: dbRow.citizen_id,
      description: dbRow.description,
      category: dbRow.category,
      priority: dbRow.priority,
      status: dbRow.status,
      location: dbRow.location ? this.parseLocation(dbRow.location) : undefined,
      photoUrls: dbRow.photo_url ? [dbRow.photo_url] : [],
      createdAt: new Date(dbRow.created_at),
      updatedAt: new Date(dbRow.updated_at),
    };
  },

  // Parses PostGIS POINT to location object
  parseLocation(locationStr: string): { latitude: number; longitude: number } | undefined {
    // Parse PostGIS POINT format: "POINT(longitude latitude)"
    const match = locationStr.match(/POINT\(([^)]+)\)/);
    if (match && match[1]) {
      const coords = match[1].split(' ').map(coord => parseFloat(coord.trim()));
      if (coords.length === 2 && coords.every(coord => !isNaN(coord))) {
        const [longitude, latitude] = coords;
        if (typeof longitude === 'number' && typeof latitude === 'number') {
          return { latitude, longitude };
        }
      }
    }
    return undefined;
  },
};
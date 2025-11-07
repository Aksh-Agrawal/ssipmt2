import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // Get latest traffic data for heatmap
    const { data, error } = await supabase
      .from('traffic_data')
      .select('road_segment_id, congestion_level, avg_speed, vehicle_count')
      .order('timestamp', { ascending: false })
      .limit(100);

    if (error) {
      throw error;
    }

    // Transform data for heatmap
    // In production, you'd join with road_segments table to get actual coordinates
    const heatmapData = (data || []).map((traffic: any) => ({
      road_segment_id: traffic.road_segment_id,
      congestion_level: traffic.congestion_level,
      avg_speed: traffic.avg_speed,
      vehicle_count: traffic.vehicle_count,
      // TODO: Add actual lat/lng from road_segments table
      // For now, generating random points around Raipur
      lat: 21.2514 + (Math.random() - 0.5) * 0.1,
      lng: 81.6296 + (Math.random() - 0.5) * 0.1,
    }));

    return NextResponse.json(heatmapData);
  } catch (error: any) {
    console.error('Error fetching traffic heatmap data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch traffic heatmap data', details: error.message },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';

// GET /api/traffic - Get traffic data with filters
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const severity = searchParams.get('severity');
    const status = searchParams.get('status') || 'active';
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build query
    let query = supabaseAdmin
      .from('traffic_data')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    // Apply filters
    if (severity) query = query.eq('severity', severity);
    if (status) query = query.eq('status', status);

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/traffic - Create traffic data entry (admin only)
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user role
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('clerk_id', userId)
      .single();

    if (userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const {
      location, // { lat, lng }
      road_name,
      severity = 'Medium',
      congestion_level,
      average_speed,
      estimated_delay_minutes,
      incident_type,
      description,
      affected_routes = [],
      alternative_routes = [],
    } = body;

    if (!location || !road_name) {
      return NextResponse.json(
        { error: 'Missing required fields: location, road_name' },
        { status: 400 }
      );
    }

    // Convert location to PostGIS format
    const locationGeog = `POINT(${location.lng} ${location.lat})`;

    // Insert traffic data
    const { data, error } = await supabaseAdmin
      .from('traffic_data')
      .insert({
        location: locationGeog,
        road_name,
        severity,
        congestion_level,
        average_speed,
        estimated_delay_minutes,
        incident_type,
        description,
        affected_routes,
        alternative_routes,
        status: 'active',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Traffic data created successfully',
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

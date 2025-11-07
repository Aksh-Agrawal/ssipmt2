import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';

// GET /api/events - Get events with filters
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const upcoming = searchParams.get('upcoming') === 'true';
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build query
    let query = supabaseAdmin
      .from('events')
      .select('*')
      .order('start_time', { ascending: true })
      .limit(limit);

    // Apply filters
    if (type) query = query.eq('event_type', type);
    
    if (upcoming) {
      query = query.gte('start_time', new Date().toISOString());
    }

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

// POST /api/events - Create event (admin only)
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
      event_name,
      event_type,
      location, // { lat, lng }
      venue_name,
      start_time,
      end_time,
      expected_attendance,
      traffic_impact_multiplier = 1.5,
      affected_roads = [],
      description,
    } = body;

    if (!event_name || !event_type || !location || !start_time) {
      return NextResponse.json(
        { error: 'Missing required fields: event_name, event_type, location, start_time' },
        { status: 400 }
      );
    }

    // Convert location to PostGIS format
    const locationGeog = `POINT(${location.lng} ${location.lat})`;

    // Insert event
    const { data, error } = await supabaseAdmin
      .from('events')
      .insert({
        event_name,
        event_type,
        location: locationGeog,
        venue_name,
        start_time,
        end_time,
        expected_attendance,
        traffic_impact_multiplier,
        affected_roads,
        description,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Event created successfully',
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

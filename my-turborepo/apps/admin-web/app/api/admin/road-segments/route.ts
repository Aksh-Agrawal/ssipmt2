import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    // Fetch all road segments from database
    const { data: segments, error } = await supabase
      .from('road_segments')
      .select('*')
      .eq('is_active', true)
      .order('road_name', { ascending: true });

    if (error) {
      console.error('Error fetching road segments:', error);
      return NextResponse.json(
        { error: 'Failed to load road segments', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ segments: segments || [] });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

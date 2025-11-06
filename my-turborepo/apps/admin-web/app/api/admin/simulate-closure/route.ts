import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface SimulationRequest {
  road_segment_id: string;
  closure_reason: string;
  closure_date: string;
  start_time: string;
  end_time: string;
}

interface SimulationResult {
  affected_segments: Array<{
    id: string;
    name: string;
    predicted_congestion: string;
    predicted_delay_minutes: number;
    normal_speed: number;
    predicted_speed: number;
  }>;
  alternative_routes: Array<{
    route: string;
    distance_km: number;
    estimated_time_minutes: number;
    traffic_increase: string;
  }>;
  overall_impact: {
    total_affected_segments: number;
    avg_delay_minutes: number;
    severity: 'low' | 'medium' | 'high' | 'severe';
    recommendation: string;
  };
  simulation_id: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: SimulationRequest = await req.json();
    const { road_segment_id, closure_reason, closure_date, start_time, end_time } = body;

    // Validate input
    if (!road_segment_id || !closure_reason || !closure_date || !start_time || !end_time) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 1. Get the road segment being closed
    const { data: closedSegment, error: segmentError } = await supabase
      .from('road_segments')
      .select('*')
      .eq('id', road_segment_id)
      .single();

    if (segmentError || !closedSegment) {
      return NextResponse.json(
        { error: 'Road segment not found' },
        { status: 404 }
      );
    }

    // 2. Find nearby/connected road segments (simplified: within same road or nearby)
    const { data: nearbySegments, error: nearbyError } = await supabase
      .from('road_segments')
      .select('*')
      .or(`road_name.eq.${closedSegment.road_name},road_type.eq.${closedSegment.road_type}`)
      .neq('id', road_segment_id)
      .eq('is_active', true)
      .limit(10);

    if (nearbyError) {
      console.error('Error fetching nearby segments:', nearbyError);
    }

    // 3. Get historical traffic data for the closed segment
    const closureHour = parseInt((start_time || '9:00').split(':')[0] || '9');
    const closureDayOfWeek = new Date(closure_date).getDay();

    const { data: historicalData, error: historicalError } = await supabase
      .from('traffic_data')
      .select('*')
      .eq('road_segment_id', road_segment_id)
      .eq('hour', closureHour)
      .eq('day_of_week', closureDayOfWeek)
      .order('date', { ascending: false })
      .limit(5);

    if (historicalError) {
      console.error('Error fetching historical data:', historicalError);
    }

    // 4. Calculate average traffic for closed segment
    const avgTraffic = historicalData && historicalData.length > 0
      ? historicalData.reduce((sum, d) => sum + d.vehicle_count, 0) / historicalData.length
      : 500; // Default fallback

    const avgCongestion = historicalData && historicalData.length > 0
      ? historicalData[0].congestion_level
      : 'moderate';

    // 5. Run simulation algorithm
    const trafficDiversionRatio = 0.7; // 70% of traffic diverted to nearby roads
    const divertedTraffic = avgTraffic * trafficDiversionRatio;

    // Calculate impact on nearby segments
    const affectedSegments = (nearbySegments || []).slice(0, 5).map((segment) => {
      // Simplified traffic redistribution model
      const additionalTraffic = divertedTraffic / (nearbySegments?.length || 1);
      const normalSpeed = segment.speed_limit;
      const trafficIncrease = (additionalTraffic / 1000) * 100; // Percentage increase

      // Predict congestion based on traffic increase
      let predictedCongestion: string;
      let predictedSpeed: number;
      let delayMinutes: number;

      if (trafficIncrease > 50) {
        predictedCongestion = 'severe';
        predictedSpeed = normalSpeed * 0.3;
        delayMinutes = Math.round((segment.length_km / predictedSpeed) * 60 * 0.7);
      } else if (trafficIncrease > 30) {
        predictedCongestion = 'high';
        predictedSpeed = normalSpeed * 0.5;
        delayMinutes = Math.round((segment.length_km / predictedSpeed) * 60 * 0.5);
      } else if (trafficIncrease > 15) {
        predictedCongestion = 'moderate';
        predictedSpeed = normalSpeed * 0.7;
        delayMinutes = Math.round((segment.length_km / predictedSpeed) * 60 * 0.3);
      } else {
        predictedCongestion = 'low';
        predictedSpeed = normalSpeed * 0.9;
        delayMinutes = Math.round((segment.length_km / predictedSpeed) * 60 * 0.1);
      }

      return {
        id: segment.id,
        name: segment.name,
        predicted_congestion: predictedCongestion,
        predicted_delay_minutes: delayMinutes,
        normal_speed: normalSpeed,
        predicted_speed: Math.round(predictedSpeed),
      };
    });

    // 6. Generate alternative routes (simplified)
    const alternativeRoutes = [
      {
        route: `Via ${closedSegment.road_type === 'major' ? 'Ring Road' : 'Main Arterial'}`,
        distance_km: closedSegment.length_km * 1.3,
        estimated_time_minutes: Math.round((closedSegment.length_km * 1.3) / 40 * 60),
        traffic_increase: '+20-30%',
      },
      {
        route: `Alternative: ${closedSegment.start_point} → Bypass → ${closedSegment.end_point}`,
        distance_km: closedSegment.length_km * 1.5,
        estimated_time_minutes: Math.round((closedSegment.length_km * 1.5) / 45 * 60),
        traffic_increase: '+40-50%',
      },
    ];

    // 7. Calculate overall impact
    const avgDelay = affectedSegments.length > 0
      ? Math.round(affectedSegments.reduce((sum, s) => sum + s.predicted_delay_minutes, 0) / affectedSegments.length)
      : 10;

    let severity: 'low' | 'medium' | 'high' | 'severe';
    let recommendation: string;

    if (avgDelay > 30) {
      severity = 'severe';
      recommendation = '🚨 Critical impact. Consider alternative timing or provide extensive signage and traffic management personnel.';
    } else if (avgDelay > 20) {
      severity = 'high';
      recommendation = '⚠️ High impact. Deploy traffic police at key junctions. Issue public advisory 48 hours in advance.';
    } else if (avgDelay > 10) {
      severity = 'medium';
      recommendation = '⚡ Moderate impact. Issue public advisory 24 hours in advance. Monitor peak hours closely.';
    } else {
      severity = 'low';
      recommendation = '✅ Low impact. Standard signage should suffice. Brief public notification recommended.';
    }

    // 8. Store simulation in database
    const closureStartTime = `${closure_date} ${start_time}:00`;
    const closureEndTime = `${closure_date} ${end_time}:00`;

    const { data: closureRecord, error: closureError } = await supabase
      .from('road_closures')
      .insert({
        road_segment_id,
        closure_type: 'simulation',
        reason: closure_reason,
        start_time: closureStartTime,
        end_time: closureEndTime,
        status: 'simulated',
        is_simulation: true,
        simulation_results: {
          affected_segments: affectedSegments,
          alternative_routes: alternativeRoutes,
          overall_impact: {
            total_affected_segments: affectedSegments.length,
            avg_delay_minutes: avgDelay,
            severity,
            recommendation,
          },
          timestamp: new Date().toISOString(),
        },
        estimated_delay_minutes: avgDelay,
        alternative_routes: alternativeRoutes.map(r => r.route),
      })
      .select()
      .single();

    if (closureError) {
      console.error('Error storing closure simulation:', closureError);
      // Continue even if storage fails
    }

    // 9. Return simulation results
    const result: SimulationResult = {
      affected_segments: affectedSegments,
      alternative_routes: alternativeRoutes,
      overall_impact: {
        total_affected_segments: affectedSegments.length,
        avg_delay_minutes: avgDelay,
        severity,
        recommendation,
      },
      simulation_id: closureRecord?.id || 'temp-' + Date.now(),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Simulation error:', error);
    return NextResponse.json(
      { error: 'Failed to run simulation', details: String(error) },
      { status: 500 }
    );
  }
}

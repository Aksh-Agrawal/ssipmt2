import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';

// GET /api/stats/dashboard - Get dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user role
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('id, role')
      .eq('clerk_id', userId)
      .single();

    const isAdmin = userData?.role === 'admin';
    const citizenId = userData?.id;

    // Total reports
    let totalReportsQuery = supabaseAdmin
      .from('reports')
      .select('*', { count: 'exact', head: true });

    if (!isAdmin && citizenId) {
      totalReportsQuery = totalReportsQuery.eq('citizen_id', citizenId);
    }

    const { count: totalReports } = await totalReportsQuery;

    // Reports by status
    const statuses = ['Submitted', 'Under Review', 'In Progress', 'Resolved', 'Closed'];
    const statusCounts: Record<string, number> = {};

    for (const status of statuses) {
      let query = supabaseAdmin
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .eq('status', status);

      if (!isAdmin && citizenId) {
        query = query.eq('citizen_id', citizenId);
      }

      const { count } = await query;
      statusCounts[status] = count || 0;
    }

    // Reports by category
    const categories = ['Potholes', 'Streetlights', 'Garbage', 'Water Supply', 'Traffic Signal', 'Other'];
    const categoryCounts: Record<string, number> = {};

    for (const category of categories) {
      let query = supabaseAdmin
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .eq('category', category);

      if (!isAdmin && citizenId) {
        query = query.eq('citizen_id', citizenId);
      }

      const { count } = await query;
      categoryCounts[category] = count || 0;
    }

    // Reports by priority
    const priorities = ['Critical', 'High', 'Medium', 'Low'];
    const priorityCounts: Record<string, number> = {};

    for (const priority of priorities) {
      let query = supabaseAdmin
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .eq('priority', priority);

      if (!isAdmin && citizenId) {
        query = query.eq('citizen_id', citizenId);
      }

      const { count } = await query;
      priorityCounts[priority] = count || 0;
    }

    // Recent reports
    let recentReportsQuery = supabaseAdmin
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (!isAdmin && citizenId) {
      recentReportsQuery = recentReportsQuery.eq('citizen_id', citizenId);
    }

    const { data: recentReports } = await recentReportsQuery;

    // Admin-only stats
    let adminStats = {};
    if (isAdmin) {
      // Total users
      const { count: totalUsers } = await supabaseAdmin
        .from('users')
        .select('*', { count: 'exact', head: true });

      // Pending reports (Submitted + Under Review)
      const { count: pendingReports } = await supabaseAdmin
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .in('status', ['Submitted', 'Under Review']);

      // Overdue reports (past SLA deadline)
      const { count: overdueReports } = await supabaseAdmin
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .lt('sla_deadline', new Date().toISOString())
        .not('status', 'in', '(Resolved,Closed)');

      // Resolution rate
      const { count: resolvedReports } = await supabaseAdmin
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Resolved');

      const resolutionRate = totalReports ? ((resolvedReports || 0) / (totalReports || 1)) * 100 : 0;

      adminStats = {
        totalUsers: totalUsers || 0,
        pendingReports: pendingReports || 0,
        overdueReports: overdueReports || 0,
        resolutionRate: Math.round(resolutionRate * 10) / 10,
      };
    }

    return NextResponse.json({
      success: true,
      data: {
        totalReports: totalReports || 0,
        statusCounts,
        categoryCounts,
        priorityCounts,
        recentReports: recentReports || [],
        ...adminStats,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

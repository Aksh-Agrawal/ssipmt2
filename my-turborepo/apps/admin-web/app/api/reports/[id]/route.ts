import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';

// GET /api/reports/[id] - Get single report with details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Fetch report with related data
    const { data: report, error } = await supabaseAdmin
      .from('reports')
      .select(`
        *,
        citizen:users!reports_citizen_id_fkey(id, name, email, phone),
        assigned_to_user:users!reports_assigned_to_fkey(id, name, email)
      `)
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Fetch comments
    const { data: comments } = await supabaseAdmin
      .from('report_comments')
      .select(`
        *,
        commenter:users(id, name, email, role)
      `)
      .eq('report_id', id)
      .order('created_at', { ascending: true });

    // Fetch timeline
    const { data: timeline } = await supabaseAdmin
      .from('report_timeline')
      .select(`
        *,
        performer:users(id, name, email, role)
      `)
      .eq('report_id', id)
      .order('created_at', { ascending: true });

    return NextResponse.json({
      success: true,
      data: {
        ...report,
        comments: comments || [],
        timeline: timeline || [],
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/reports/[id] - Update report status, assignment, etc.
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const {
      status,
      priority,
      category,
      assigned_to,
      admin_notes,
      resolution_notes,
    } = body;

    // Get user from database
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('id, role')
      .eq('clerk_id', userId)
      .single();

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has permission to update (admin only)
    if (userData.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Build update object
    const updates: any = {};
    if (status) updates.status = status;
    if (priority) updates.priority = priority;
    if (category) updates.category = category;
    if (assigned_to !== undefined) updates.assigned_to = assigned_to;
    if (admin_notes) updates.admin_notes = admin_notes;
    if (resolution_notes) updates.resolution_notes = resolution_notes;

    // If status is changing to 'Resolved' or 'Closed', set resolved_at
    if (status === 'Resolved' || status === 'Closed') {
      updates.resolved_at = new Date().toISOString();
    }

    // Update report
    const { data: report, error: updateError } = await supabaseAdmin
      .from('reports')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Create timeline entry
    let timelineDescription = 'Report updated';
    if (status) timelineDescription = `Status changed to ${status}`;
    if (assigned_to) timelineDescription = `Report assigned`;

    await supabaseAdmin.from('report_timeline').insert({
      report_id: id,
      action: 'Report Updated',
      description: timelineDescription,
      performed_by: userData.id,
    });

    return NextResponse.json({
      success: true,
      data: report,
      message: 'Report updated successfully',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

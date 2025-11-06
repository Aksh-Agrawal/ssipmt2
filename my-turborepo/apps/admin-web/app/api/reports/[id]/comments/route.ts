import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';

// POST /api/reports/[id]/comments - Add comment to report
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: reportId } = await params;
    const body = await request.json();
    const { comment_text } = body;

    if (!comment_text || comment_text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Comment text is required' },
        { status: 400 }
      );
    }

    // Get user from database
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single();

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Insert comment
    const { data: comment, error: commentError } = await supabaseAdmin
      .from('report_comments')
      .insert({
        report_id: reportId,
        commenter_id: userData.id,
        comment_text,
      })
      .select(`
        *,
        commenter:users(id, name, email, role)
      `)
      .single();

    if (commentError) {
      return NextResponse.json({ error: commentError.message }, { status: 500 });
    }

    // Create timeline entry
    await supabaseAdmin.from('report_timeline').insert({
      report_id: reportId,
      action: 'Comment Added',
      description: `Comment added by ${userData.id}`,
      performed_by: userData.id,
    });

    return NextResponse.json({
      success: true,
      data: comment,
      message: 'Comment added successfully',
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET /api/reports/[id]/comments - Get all comments for a report
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: reportId } = await params;

    const { data: comments, error } = await supabaseAdmin
      .from('report_comments')
      .select(`
        *,
        commenter:users(id, name, email, role)
      `)
      .eq('report_id', reportId)
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: comments || [],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

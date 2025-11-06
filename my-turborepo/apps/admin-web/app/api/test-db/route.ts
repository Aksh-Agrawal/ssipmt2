import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    // Test 1: Check connection
    const { data: tables, error: tablesError } = await supabaseAdmin
      .from('system_settings')
      .select('*')
      .limit(1);

    if (tablesError) {
      return NextResponse.json(
        { 
          success: false,
          error: tablesError.message,
          hint: 'Make sure you ran the schema-complete.sql in Supabase SQL Editor'
        },
        { status: 500 }
      );
    }

    // Test 2: Count reports
    const { count: reportsCount } = await supabaseAdmin
      .from('reports')
      .select('*', { count: 'exact', head: true });

    // Test 3: Count users
    const { count: usersCount } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true });

    // Test 4: Check system settings
    const { data: settings } = await supabaseAdmin
      .from('system_settings')
      .select('key, value')
      .limit(5);

    return NextResponse.json({
      success: true,
      message: '✅ Database connection successful!',
      data: {
        reportsCount: reportsCount || 0,
        usersCount: usersCount || 0,
        systemSettings: settings || [],
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json(
      { 
        success: false,
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

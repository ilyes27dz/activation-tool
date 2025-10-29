import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Get all codes with full details
export async function GET() {
  try {
    const codes = await sql`
      SELECT 
        id,
        activation_code,
        client_name,
        client_phone,
        machine_id,
        COALESCE(computer_name, '') as computer_name,
        type,
        COALESCE(trial_days, 0) as trial_days,
        COALESCE(is_used, false) as is_used,
        created_at,
        used_at,
        expiry_date,
        COALESCE(status, 'active') as status,
        last_seen,
        deactivated_at,
        deactivated_by,
        COALESCE(notes, '') as notes,
        CASE 
          WHEN last_seen > NOW() - INTERVAL '5 minutes' THEN 'online'
          WHEN last_seen IS NOT NULL THEN 'offline'
          ELSE 'never_used'
        END as online_status
      FROM activation_codes
      ORDER BY created_at DESC
    `;

    return NextResponse.json({ success: true, codes });
  } catch (error) {
    console.error('Admin codes error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      codes: []
    }, { status: 500 });
  }
}

// Deactivate/Reactivate a code
export async function POST(request) {
  try {
    const { action, id, admin } = await request.json();

    if (action === 'deactivate') {
      await sql`
        UPDATE activation_codes
        SET status = 'deactivated',
            deactivated_at = NOW(),
            deactivated_by = ${admin || 'Admin'}
        WHERE id = ${id}
      `;

      return NextResponse.json({ success: true, message: 'Code deactivated' });
    }

    if (action === 'reactivate') {
      await sql`
        UPDATE activation_codes
        SET status = 'active',
            deactivated_at = NULL,
            deactivated_by = NULL
        WHERE id = ${id}
      `;

      return NextResponse.json({ success: true, message: 'Code reactivated' });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Admin action error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

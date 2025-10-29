// app/api/codes/list/route.js
import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    let result;

    if (search) {
      // بحث في الاسم، الرقم، أو Machine ID
      result = await sql`
        SELECT * FROM activation_codes
        WHERE 
          client_name ILIKE ${'%' + search + '%'} OR
          client_phone ILIKE ${'%' + search + '%'} OR
          machine_id ILIKE ${'%' + search + '%'} OR
          activation_code ILIKE ${'%' + search + '%'}
        ORDER BY created_at DESC
      `;
    } else {
      // جلب كل الأكواد
      result = await sql`
        SELECT * FROM activation_codes
        ORDER BY created_at DESC
      `;
    }

    return NextResponse.json({ 
      success: true, 
      codes: result.rows 
    });

  } catch (error) {
    console.error('List codes error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

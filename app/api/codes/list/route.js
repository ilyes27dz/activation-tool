import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

// ✅ إضافة dynamic لحل مشكلة Vercel
export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all';

    let codes;
    
    if (filter === 'used') {
      codes = await sql`
        SELECT * FROM activation_codes 
        WHERE is_used = true 
        ORDER BY created_at DESC
      `;
    } else if (filter === 'unused') {
      codes = await sql`
        SELECT * FROM activation_codes 
        WHERE is_used = false 
        ORDER BY created_at DESC
      `;
    } else {
      codes = await sql`
        SELECT * FROM activation_codes 
        ORDER BY created_at DESC
      `;
    }

    return NextResponse.json({ codes });
  } catch (error) {
    console.error('List codes error:', error);
    return NextResponse.json({ codes: [], error: error.message }, { status: 500 });
  }
}

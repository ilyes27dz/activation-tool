import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all';

    let queryText = 'SELECT * FROM activation_codes';
    
    if (filter === 'used') {
      queryText += ' WHERE is_used = true';
    } else if (filter === 'unused') {
      queryText += ' WHERE is_used = false';
    }
    
    queryText += ' ORDER BY created_at DESC';

    const result = await query(queryText);

    return NextResponse.json({ codes: result.rows });
  } catch (error) {
    console.error('List codes error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

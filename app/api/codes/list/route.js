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
    } else if (filter === 'trial') {
      queryText += " WHERE type = 'trial'";
    } else if (filter === 'full') {
      queryText += " WHERE type = 'full'";
    }
    
    queryText += ' ORDER BY created_at DESC';

    const result = await query(queryText);

    return NextResponse.json({ 
      success: true,
      codes: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('List codes error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const totalResult = await sql`SELECT COUNT(*) FROM activation_codes`;
    const usedResult = await sql`SELECT COUNT(*) FROM activation_codes WHERE is_used = true`;
    const trialResult = await sql`SELECT COUNT(*) FROM activation_codes WHERE type = 'trial'`;
    const fullResult = await sql`SELECT COUNT(*) FROM activation_codes WHERE type = 'full'`;

    const total = parseInt(totalResult.rows[0].count);
    const used = parseInt(usedResult.rows[0].count);

    return NextResponse.json({
      total,
      used,
      unused: total - used,
      trial: parseInt(trialResult.rows[0].count),
      full: parseInt(fullResult.rows[0].count),
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

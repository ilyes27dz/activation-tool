import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const totalResult = await query('SELECT COUNT(*) FROM activation_codes');
    const usedResult = await query('SELECT COUNT(*) FROM activation_codes WHERE is_used = true');
    const trialResult = await query("SELECT COUNT(*) FROM activation_codes WHERE type = 'trial'");
    const fullResult = await query("SELECT COUNT(*) FROM activation_codes WHERE type = 'full'");

    return NextResponse.json({
      total: parseInt(totalResult.rows[0].count),
      used: parseInt(usedResult.rows[0].count),
      unused: parseInt(totalResult.rows[0].count) - parseInt(usedResult.rows[0].count),
      trial: parseInt(trialResult.rows[0].count),
      full: parseInt(fullResult.rows[0].count),
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

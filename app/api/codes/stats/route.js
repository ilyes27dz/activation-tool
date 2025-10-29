import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // عدد الأكواد الكلي
    const totalResult = await query('SELECT COUNT(*) FROM activation_codes');
    
    // عدد الأكواد المستخدمة
    const usedResult = await query('SELECT COUNT(*) FROM activation_codes WHERE is_used = true');
    
    // عدد أكواد التجربة
    const trialResult = await query("SELECT COUNT(*) FROM activation_codes WHERE type = 'trial'");
    
    // عدد الأكواد الكاملة
    const fullResult = await query("SELECT COUNT(*) FROM activation_codes WHERE type = 'full'");

    const total = parseInt(totalResult.rows[0].count);
    const used = parseInt(usedResult.rows[0].count);
    const trial = parseInt(trialResult.rows[0].count);
    const full = parseInt(fullResult.rows[0].count);

    return NextResponse.json({
      success: true,
      stats: {
        total,
        used,
        unused: total - used,
        trial,
        full,
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

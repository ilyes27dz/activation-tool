// app/api/codes/stats/route.js
import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // إجمالي الأكواد
    const total = await sql`SELECT COUNT(*) as count FROM activation_codes`;
    
    // الأكواد الكاملة
    const full = await sql`SELECT COUNT(*) as count FROM activation_codes WHERE type = 'full'`;
    
    // الأكواد التجريبية
    const trial = await sql`SELECT COUNT(*) as count FROM activation_codes WHERE type = 'trial'`;
    
    // الأكواد المستخدمة
    const used = await sql`SELECT COUNT(*) as count FROM activation_codes WHERE is_used = true`;

    return NextResponse.json({
      success: true,
      stats: {
        total: parseInt(total.rows[0].count),
        full: parseInt(full.rows[0].count),
        trial: parseInt(trial.rows[0].count),
        used: parseInt(used.rows[0].count),
      }
    });

  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { activationCode, machineId } = await request.json();

    if (!activationCode || !machineId) {
      return NextResponse.json({ 
        success: false, 
        valid: false,
        message: 'بيانات غير كاملة' 
      });
    }

    const result = await sql`
      SELECT * FROM activation_codes 
      WHERE activation_code = ${activationCode.toUpperCase()}
      LIMIT 1
    `;

    // استخراج الأكواد بطريقة صحيحة
    const codes = Array.isArray(result) ? result : (result.rows || []);

    if (codes.length === 0) {
      return NextResponse.json({ 
        success: true,
        valid: false,
        message: 'الكود غير موجود' 
      });
    }

    const code = codes[0];

    // التحقق من حالة التفعيل (status)
    if (code.status === 'deactivated') {
      return NextResponse.json({ 
        success: true,
        valid: false,
        deactivated: true,
        message: 'تم إيقاف هذا التفعيل من قبل المطور' 
      });
    }

    if (code.is_used && code.machine_id !== machineId) {
      return NextResponse.json({ 
        success: true,
        valid: false,
        message: 'الكود مستخدم على جهاز آخر' 
      });
    }

    if (code.type === 'trial' && code.expiry_date) {
      const expiryDate = new Date(code.expiry_date);
      if (expiryDate < new Date()) {
        return NextResponse.json({ 
          success: true,
          valid: false,
          message: 'الكود منتهي الصلاحية' 
        });
      }
    }

    // تحديث حالة الاستخدام + آخر نشاط
    if (!code.is_used) {
      await sql`
        UPDATE activation_codes 
        SET is_used = true, 
            machine_id = ${machineId},
            used_at = NOW(),
            last_seen = NOW()
        WHERE id = ${code.id}
      `;
    } else {
      // تحديث آخر نشاط فقط
      await sql`
        UPDATE activation_codes 
        SET last_seen = NOW()
        WHERE id = ${code.id}
      `;
    }

    return NextResponse.json({ 
      success: true,
      valid: true,
      type: code.type,
      trialDays: code.trial_days || 0,
      message: 'تم التفعيل بنجاح'
    });

  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json({ 
      success: false, 
      valid: false,
      message: 'خطأ في الخادم: ' + error.message 
    }, { status: 500 });
  }
}

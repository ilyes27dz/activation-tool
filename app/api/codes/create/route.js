import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// توليد كود فريد
function generateCode(type, machineId) {
  const prefix = type === 'trial' ? 'TRIAL' : 'FULL';
  const random = Math.random().toString(36).substring(2, 10).toUpperCase();
  const machineHash = machineId.substring(0, 6).toUpperCase();
  const timestamp = Date.now().toString(36).toUpperCase();
  return `${prefix}-${machineHash}-${random}-${timestamp}`;
}

export async function POST(request) {
  try {
    const { clientName, clientPhone, machineId, type, trialDays, notes } = await request.json();

    // التحقق من البيانات المطلوبة
    if (!clientName || !clientPhone || !machineId || !type) {
      return NextResponse.json(
        { success: false, error: 'جميع الحقول مطلوبة' },
        { status: 400 }
      );
    }

    // توليد كود التفعيل
    const activationCode = generateCode(type, machineId);
    
    // حساب تاريخ الانتهاء (للأكواد التجريبية فقط)
    const expiryDate = type === 'trial' && trialDays ? 
      new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : 
      null;

    // إدخال الكود في قاعدة البيانات
    const result = await query(
      `INSERT INTO activation_codes 
       (client_name, client_phone, machine_id, activation_code, type, trial_days, expiry_date, notes) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [clientName, clientPhone, machineId, activationCode, type, trialDays || null, expiryDate, notes || null]
    );

    return NextResponse.json({ 
      success: true, 
      code: result.rows[0],
      message: 'تم إنشاء كود التفعيل بنجاح'
    });
  } catch (error) {
    console.error('Create code error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

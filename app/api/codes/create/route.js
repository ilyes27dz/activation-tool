// app/api/codes/create/route.js
import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

// دالة توليد كود كامل
async function generateActivationKey(machineId) {
  const SECRET_KEY = "HANOUTY_DZ_2025_SECRET_KEY_DO_NOT_SHARE";
  const combined = `${machineId}-${SECRET_KEY}`;
  
  const hash = crypto.createHash('sha256').update(combined).digest('hex');
  const code = hash.substring(0, 16).toUpperCase();
  
  return `HK-${code.substring(0, 4)}-${code.substring(4, 8)}-${code.substring(8, 12)}-${code.substring(12, 16)}`;
}

// دالة توليد كود تجريبي
async function generateTrialCode(machineId, days) {
  const SECRET_KEY = "TRIAL_KEY_2025_HANOUTY";
  const combined = `${machineId}-${days}-${SECRET_KEY}`;
  
  const hash = crypto.createHash('sha256').update(combined).digest('hex');
  const code = hash.substring(0, 12).toUpperCase();
  
  return `HT-${days}D-${code.substring(0, 4)}-${code.substring(4, 8)}-${code.substring(8, 12)}`;
}

export async function POST(request) {
  try {
    const { clientName, clientPhone, machineId, type, trialDays, notes } = await request.json();

    // التحقق من البيانات
    if (!clientName || !clientPhone || !machineId || !type) {
      return NextResponse.json({ 
        success: false, 
        error: 'يرجى ملء جميع الحقول المطلوبة' 
      }, { status: 400 });
    }

    // توليد الكود
    let activationCode;
    let expiryDate = null;

    if (type === 'full') {
      activationCode = await generateActivationKey(machineId);
    } else if (type === 'trial') {
      if (!trialDays) {
        return NextResponse.json({ 
          success: false, 
          error: 'يرجى تحديد عدد الأيام للنسخة التجريبية' 
        }, { status: 400 });
      }
      activationCode = await generateTrialCode(machineId, trialDays);
      
      // حساب تاريخ الانتهاء
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + parseInt(trialDays));
      expiryDate = expiry.toISOString().split('T')[0];
    } else {
      return NextResponse.json({ 
        success: false, 
        error: 'نوع الكود غير صحيح' 
      }, { status: 400 });
    }

    // حفظ في قاعدة البيانات
    const result = await sql`
      INSERT INTO activation_codes (
        client_name, 
        client_phone, 
        machine_id, 
        activation_code, 
        type, 
        trial_days, 
        expiry_date, 
        notes
      )
      VALUES (
        ${clientName},
        ${clientPhone},
        ${machineId},
        ${activationCode},
        ${type},
        ${trialDays || null},
        ${expiryDate},
        ${notes || null}
      )
      RETURNING *
    `;

    return NextResponse.json({ 
      success: true, 
      code: result.rows[0] 
    });

  } catch (error) {
    console.error('Create code error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

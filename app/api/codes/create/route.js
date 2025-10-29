import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

function generateCode(type, machineId) {
  const prefix = type === 'trial' ? 'TRIAL' : 'FULL';
  const random = Math.random().toString(36).substring(2, 10).toUpperCase();
  const machineHash = machineId.substring(0, 6).toUpperCase();
  return `${prefix}-${machineHash}-${random}`;
}

export async function POST(request) {
  try {
    const { clientName, clientPhone, machineId, type, trialDays, notes } = await request.json();

    const activationCode = generateCode(type, machineId);
    const expiryDate = type === 'trial' && trialDays ? 
      new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : 
      null;

    const result = await sql`
      INSERT INTO activation_codes 
      (client_name, client_phone, machine_id, activation_code, type, trial_days, expiry_date, notes) 
      VALUES (${clientName}, ${clientPhone}, ${machineId}, ${activationCode}, ${type}, ${trialDays || null}, ${expiryDate}, ${notes || null})
      RETURNING *
    `;

    // استخراج الكود بطرق مختلفة حسب شكل النتيجة
    let createdCode;
    
    if (Array.isArray(result) && result.length > 0) {
      createdCode = result[0];
    } else if (result.rows && result.rows.length > 0) {
      createdCode = result.rows[0];
    } else if (result.command === 'INSERT') {
      // إذا كانت النتيجة من نوع Result object
      createdCode = result.rows?.[0] || result;
    } else {
      createdCode = result;
    }

    // إضافة activation_code إذا لم يكن موجود
    if (!createdCode.activation_code && activationCode) {
      createdCode.activation_code = activationCode;
    }

    return NextResponse.json({ 
      success: true, 
      code: createdCode
    });
  } catch (error) {
    console.error('Create code error:', error);
    return NextResponse.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
}

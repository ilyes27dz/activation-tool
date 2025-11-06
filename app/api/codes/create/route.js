import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

// ✅ دالة توليد Hash من Machine ID
function generateHash(machineId) {
  return crypto.createHash('sha256').update(machineId).digest('hex').substring(0, 8).toUpperCase();
}

// ✅ دالة توليد الكود مع Hash
function generateCode(type, machineId) {
  const hash = generateHash(machineId);
  
  if (type === 'full') {
    // صيغة: HK-HASH-RAND-RAND-RAND
    const rand1 = crypto.randomBytes(2).toString('hex').toUpperCase();
    const rand2 = crypto.randomBytes(2).toString('hex').toUpperCase();
    const rand3 = crypto.randomBytes(2).toString('hex').toUpperCase();
    return `HK-${hash}-${rand1}-${rand2}-${rand3}`;
  } else {
    // صيغة: HT-DAYS-HASH
    return `HT-${trialDays}-${hash}`;
  }
}

export async function POST(request) {
  try {
    const { clientName, clientPhone, machineId, type, trialDays, notes } = await request.json();

    if (!clientName || !clientPhone || !machineId) {
      return NextResponse.json({ 
        success: false,
        error: 'يرجى ملء جميع الحقول المطلوبة!' 
      }, { status: 400 });
    }

    const activationCode = generateCode(type, machineId, trialDays);
    const expiryDate = type === 'trial' && trialDays ? 
      new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : 
      null;

    const result = await sql`
      INSERT INTO activation_codes 
      (client_name, client_phone, machine_id, activation_code, type, trial_days, expiry_date, notes, status) 
      VALUES (
        ${clientName}, 
        ${clientPhone}, 
        ${machineId}, 
        ${activationCode}, 
        ${type}, 
        ${trialDays || null}, 
        ${expiryDate}, 
        ${notes || null},
        'active'
      )
      RETURNING *
    `;

    let createdCode;
    
    if (Array.isArray(result) && result.length > 0) {
      createdCode = result[0];
    } else if (result.rows && result.rows.length > 0) {
      createdCode = result.rows[0];
    } else {
      createdCode = result;
    }

    if (!createdCode.activation_code && activationCode) {
      createdCode.activation_code = activationCode;
    }

    return NextResponse.json({ 
      success: true, 
      code: createdCode,
      message: `تم توليد الكود بنجاح! الكود مرتبط بالجهاز: ${machineId}`
    });
  } catch (error) {
    console.error('Create code error:', error);
    return NextResponse.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
}

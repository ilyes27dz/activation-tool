import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

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
    const expiryDate = type === 'trial' ? 
      new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : 
      null;

    const result = await query(
      `INSERT INTO activation_codes 
       (client_name, client_phone, machine_id, activation_code, type, trial_days, expiry_date, notes) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [clientName, clientPhone, machineId, activationCode, type, trialDays, expiryDate, notes]
    );

    return NextResponse.json({ success: true, code: result.rows[0] });
  } catch (error) {
    console.error('Create code error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

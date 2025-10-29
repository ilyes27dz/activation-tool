import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { activationCode, machineId, computerName } = await request.json();

    await sql`
      UPDATE activation_codes
      SET last_seen = NOW(),
          computer_name = ${computerName || machineId}
      WHERE activation_code = ${activationCode}
      AND machine_id = ${machineId}
    `;

    // Log activity
    await sql`
      INSERT INTO activation_logs (activation_code, machine_id, computer_name, action)
      VALUES (${activationCode}, ${machineId}, ${computerName || 'Unknown'}, 'heartbeat')
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

// ✅ دالة توليد Hash من Machine ID
function generateHash(machineId) {
  return crypto.createHash('sha256').update(machineId).digest('hex').substring(0, 8).toUpperCase();
}

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

    const code = activationCode.toUpperCase().trim();
    const receivedMachineId = machineId.trim();

    // ============================================
    // 🔹 التحقق من صيغة الكود وHash
    // ============================================
    const codeParts = code.split('-');
    let codeType = '';
    let codeHash = '';

    // كود كامل: HK-HASH-XXXX-XXXX-XXXX
    if (code.startsWith('HK-') && codeParts.length === 5) {
      codeType = 'full';
      codeHash = codeParts[1];
    }
    // كود تجريبي: HT-DAYS-HASH
    else if (code.startsWith('HT-') && codeParts.length === 3) {
      codeType = 'trial';
      codeHash = codeParts[2];
    }
    else {
      return NextResponse.json({ 
        success: false,
        valid: false,
        message: '❌ صيغة الكود غير صحيحة!' 
      });
    }

    // ============================================
    // 🔹 التحقق من Hash الجهاز
    // ============================================
    const expectedHash = generateHash(receivedMachineId);
    
    if (codeHash !== expectedHash) {
      return NextResponse.json({ 
        success: false,
        valid: false,
        message: `❌ هذا الكود غير مخصص لهذا الجهاز!\n\nرقم الجهاز المتوقع يجب أن يُنتج Hash: ${expectedHash}\n\nالكود الصحيح يجب أن يحتوي على هذا الـ Hash.\n\nيرجى التواصل مع المطور.`,
        details: {
          expectedHash,
          receivedHash: codeHash,
          machineId: receivedMachineId.substring(0, 20) + '...'
        }
      });
    }

    // ============================================
    // 🔹 البحث عن الكود في قاعدة البيانات
    // ============================================
    const result = await sql`
      SELECT * FROM activation_codes 
      WHERE activation_code = ${code}
      LIMIT 1
    `;

    const codes = Array.isArray(result) ? result : (result.rows || []);

    if (codes.length === 0) {
      return NextResponse.json({ 
        success: true,
        valid: false,
        message: '❌ الكود غير موجود في النظام!' 
      });
    }

    const codeRecord = codes[0];

    // ============================================
    // 🔹 التحقق من تطابق Machine ID
    // ============================================
    if (codeRecord.is_used && codeRecord.machine_id !== receivedMachineId) {
      return NextResponse.json({ 
        success: false,
        valid: false,
        message: `❌ هذا الكود مخصص لجهاز آخر!\n\nرقم الجهاز المسجل: ${codeRecord.machine_id}\n\nرقم الجهاز الحالي: ${receivedMachineId}\n\nيرجى التواصل مع المطور.`,
        details: {
          registeredMachineId: codeRecord.machine_id,
          currentMachineId: receivedMachineId
        }
      });
    }

    // التحقق من حالة التفعيل (status)
    if (codeRecord.status === 'deactivated') {
      return NextResponse.json({ 
        success: true,
        valid: false,
        deactivated: true,
        message: '⚠️ تم إيقاف هذا التفعيل من قبل المطور!' 
      });
    }

    // التحقق من الصلاحية للنسخة التجريبية
    if (codeRecord.type === 'trial' && codeRecord.expiry_date) {
      const expiryDate = new Date(codeRecord.expiry_date);
      if (expiryDate < new Date()) {
        return NextResponse.json({ 
          success: true,
          valid: false,
          message: '❌ الكود منتهي الصلاحية!' 
        });
      }
    }

    // ============================================
    // 🔹 تحديث حالة الاستخدام + آخر نشاط
    // ============================================
    if (!codeRecord.is_used) {
      await sql`
        UPDATE activation_codes 
        SET is_used = true, 
            machine_id = ${receivedMachineId},
            used_at = NOW(),
            last_seen = NOW()
        WHERE id = ${codeRecord.id}
      `;
    } else {
      await sql`
        UPDATE activation_codes 
        SET last_seen = NOW()
        WHERE id = ${codeRecord.id}
      `;
    }

    return NextResponse.json({ 
      success: true,
      valid: true,
      type: codeRecord.type,
      trialDays: codeRecord.trial_days || 0,
      message: '✅ تم التفعيل بنجاح!'
    });

  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json({ 
      success: false, 
      valid: false,
      message: '❌ خطأ في الخادم: ' + error.message 
    }, { status: 500 });
  }
}

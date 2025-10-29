'use client';
import { useState } from 'react';

export default function Generator({ onCodeGenerated }) {
  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '',
    machineId: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const generateCode = async (type, trialDays = null) => {
    if (!formData.clientName || !formData.clientPhone || !formData.machineId) {
      alert('⚠️ يرجى ملء جميع الحقول المطلوبة!');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/codes/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, type, trialDays }),
      });

      const data = await response.json();
      if (data.success) {
        setResult(data.code);
        setFormData({ clientName: '', clientPhone: '', machineId: '', notes: '' });
        onCodeGenerated?.();
      } else {
        alert('❌ خطأ: ' + data.error);
      }
    } catch (error) {
      alert('❌ خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(result.activation_code);
    alert('✅ تم نسخ الكود بنجاح!');
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 border-2 border-orange-500/30">
      <h2 className="text-xl font-bold text-orange-400 mb-4 flex items-center gap-2">
        🔑 توليد كود جديد
      </h2>

      <div className="space-y-4">
        <InputField
          label="👤 اسم الزبون"
          name="clientName"
          value={formData.clientName}
          onChange={handleChange}
          placeholder="مثال: محمد أحمد"
        />

        <InputField
          label="📱 رقم الهاتف"
          name="clientPhone"
          value={formData.clientPhone}
          onChange={handleChange}
          placeholder="مثال: 0774366470"
        />

        <InputField
          label="🖥️ رقم الجهاز (Machine ID)"
          name="machineId"
          value={formData.machineId}
          onChange={handleChange}
          placeholder="مثال: 1234567890"
        />

        <div>
          <label className="block text-orange-400 text-sm font-bold mb-2">
            📝 ملاحظات (اختياري)
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="w-full bg-gray-700 text-white border-2 border-orange-500/40 rounded-lg p-3 focus:border-orange-500 outline-none"
            rows="3"
            placeholder="أي معلومات إضافية..."
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => generateCode('full')}
            disabled={loading}
            className="col-span-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50"
          >
            {loading ? '⏳ جاري التوليد...' : '💎 كود كامل (دائم)'}
          </button>

          <button
            onClick={() => generateCode('trial', 5)}
            disabled={loading}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded-lg text-sm"
          >
            ⏰ 5 أيام
          </button>
          <button
            onClick={() => generateCode('trial', 7)}
            disabled={loading}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded-lg text-sm"
          >
            ⏰ 7 أيام
          </button>
          <button
            onClick={() => generateCode('trial', 10)}
            disabled={loading}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded-lg text-sm"
          >
            ⏰ 10 أيام
          </button>
          <button
            onClick={() => generateCode('trial', 30)}
            disabled={loading}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded-lg text-sm"
          >
            ⏰ 30 يوم
          </button>
        </div>

        {result && (
          <div className="bg-green-500/10 border-2 border-green-500/40 rounded-lg p-4 mt-4">
            <p className="text-green-400 font-bold text-center mb-2">
              ✅ تم التوليد بنجاح!
            </p>
            <div className="bg-yellow-500/20 rounded-lg p-3 font-mono text-yellow-400 text-center text-lg font-bold break-all mb-3">
              {result.activation_code}
            </div>
            <button
              onClick={copyCode}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 rounded-lg"
            >
              📋 نسخ الكود
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function InputField({ label, name, value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-orange-400 text-sm font-bold mb-2">{label}</label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        className="w-full bg-gray-700 text-white border-2 border-orange-500/40 rounded-lg p-3 focus:border-orange-500 outline-none font-mono"
        placeholder={placeholder}
      />
    </div>
  );
}

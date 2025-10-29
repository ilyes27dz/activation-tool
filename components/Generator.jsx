// components/Generator.jsx
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
    setResult(null);

    try {
      const res = await fetch('/api/codes/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          type,
          trialDays,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setResult(data.code);
        setFormData({ clientName: '', clientPhone: '', machineId: '', notes: '' });
        if (onCodeGenerated) onCodeGenerated();
      } else {
        alert('❌ ' + data.error);
      }
    } catch (error) {
      alert('❌ خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    if (result) {
      navigator.clipboard.writeText(result.activation_code);
      alert('✅ تم نسخ الكود!');
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 border-2 border-orange-500/30">
      <h2 className="text-2xl font-bold text-orange-400 mb-6 flex items-center gap-2">
        🔑 توليد كود جديد
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-orange-400 text-sm font-bold mb-2">
            👤 اسم الزبون *
          </label>
          <input
            type="text"
            name="clientName"
            value={formData.clientName}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-gray-700 border-2 border-orange-500/30 rounded-lg text-white focus:border-orange-500 focus:outline-none"
            placeholder="مثال: محمد أحمد"
          />
        </div>

        <div>
          <label className="block text-orange-400 text-sm font-bold mb-2">
            📱 رقم الهاتف *
          </label>
          <input
            type="text"
            name="clientPhone"
            value={formData.clientPhone}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-gray-700 border-2 border-orange-500/30 rounded-lg text-white focus:border-orange-500 focus:outline-none"
            placeholder="مثال: 0774366470"
          />
        </div>

        <div>
          <label className="block text-orange-400 text-sm font-bold mb-2">
            🖥️ رقم الجهاز (Machine ID) *
          </label>
          <input
            type="text"
            name="machineId"
            value={formData.machineId}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-gray-700 border-2 border-orange-500/30 rounded-lg text-white focus:border-orange-500 focus:outline-none font-mono"
            placeholder="مثال: 1234567890"
          />
        </div>

        <div>
          <label className="block text-orange-400 text-sm font-bold mb-2">
            📝 ملاحظات (اختياري)
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-gray-700 border-2 border-orange-500/30 rounded-lg text-white focus:border-orange-500 focus:outline-none"
            placeholder="أي معلومات إضافية..."
            rows="2"
          />
        </div>

        <div className="grid grid-cols-1 gap-2">
          <button
            onClick={() => generateCode('full')}
            disabled={loading}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50"
          >
            💎 توليد كود كامل (دائم)
          </button>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[5, 7, 10, 30].map(days => (
              <button
                key={days}
                onClick={() => generateCode('trial', days)}
                disabled={loading}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded-lg transition-all text-sm disabled:opacity-50"
              >
                ⏰ {days} أيام
              </button>
            ))}
          </div>
        </div>

        {result && (
          <div className="mt-4 p-4 bg-green-500/20 border-2 border-green-500 rounded-lg animate-fade-in">
            <div className="text-green-400 font-bold mb-2 text-center">
              ✅ تم التوليد بنجاح!
            </div>
            <div className="bg-gray-900 p-3 rounded-lg text-center">
              <div className="text-yellow-400 font-mono text-lg font-bold mb-2">
                {result.activation_code}
              </div>
              <button
                onClick={copyCode}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all"
              >
                📋 نسخ الكود
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

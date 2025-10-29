'use client';
import { useEffect, useState } from 'react';

export default function History({ refresh }) {
  const [codes, setCodes] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCodes();
  }, [refresh, filter]);

  const fetchCodes = async () => {
    try {
      const response = await fetch(`/api/codes/list?filter=${filter}`);
      const data = await response.json();
      setCodes(data.codes || []);
    } catch (error) {
      console.error('Error fetching codes:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteCode = async (id) => {
    if (!confirm('⚠️ هل أنت متأكد من حذف هذا الكود؟')) return;

    try {
      await fetch(`/api/codes/delete?id=${id}`, { method: 'DELETE' });
      fetchCodes();
    } catch (error) {
      alert('❌ خطأ في الحذف');
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    alert('✅ تم نسخ الكود!');
  };

  const exportCSV = () => {
    const csv = [
      ['الاسم', 'الهاتف', 'Machine ID', 'النوع', 'الكود', 'التاريخ'].join(','),
      ...codes.map(c => [
        c.client_name,
        c.client_phone,
        c.machine_id,
        c.type === 'full' ? 'كامل' : 'تجريبي',
        c.activation_code,
        new Date(c.created_at).toLocaleString('ar-DZ')
      ].join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `codes_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const filteredCodes = codes.filter(c =>
    c.client_name.toLowerCase().includes(search.toLowerCase()) ||
    c.client_phone.includes(search) ||
    c.machine_id.includes(search)
  );

  return (
    <div className="bg-gray-800 rounded-xl p-6 border-2 border-orange-500/30">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <h2 className="text-xl font-bold text-orange-400 flex items-center gap-2">
          📚 سجل الأكواد
        </h2>
        <div className="flex gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="🔍 بحث..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-500"
          />
          <button
            onClick={exportCSV}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-bold"
          >
            📥 تصدير CSV
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {['all', 'used', 'unused'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-bold ${
              filter === f
                ? 'bg-orange-500 text-white'
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            }`}
          >
            {f === 'all' ? 'الكل' : f === 'used' ? 'مستخدم' : 'غير مستخدم'}
          </button>
        ))}
      </div>

      <div className="max-h-[500px] overflow-y-auto space-y-3">
        {loading ? (
          <p className="text-gray-400 text-center py-8">⏳ جاري التحميل...</p>
        ) : filteredCodes.length === 0 ? (
          <p className="text-gray-400 text-center py-8">📭 لا توجد أكواد</p>
        ) : (
          filteredCodes.map(code => (
            <div
              key={code.id}
              className="bg-gray-700/50 border border-orange-500/30 rounded-lg p-4 hover:bg-gray-700 transition-all"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="font-bold text-orange-400">{code.client_name}</div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    code.type === 'full' ? 'bg-orange-500' : 'bg-green-500'
                  } text-white`}
                >
                  {code.type === 'full' ? '💎 كامل' : '⏰ تجريبي'}
                </span>
              </div>

              <div className="text-gray-400 text-sm space-y-1 mb-3">
                <div>📱 {code.client_phone}</div>
                <div>🖥️ {code.machine_id}</div>
                <div>📅 {new Date(code.created_at).toLocaleString('ar-DZ')}</div>
                {code.notes && <div>📝 {code.notes}</div>}
              </div>

              <div className="bg-blue-500/20 rounded-lg p-2 font-mono text-blue-400 text-sm break-all mb-3">
                {code.activation_code}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => copyCode(code.activation_code)}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-bold"
                >
                  📋 نسخ
                </button>
                <button
                  onClick={() => deleteCode(code.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-bold"
                >
                  🗑️ حذف
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

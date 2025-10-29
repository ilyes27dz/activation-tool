// components/History.jsx
'use client';
import { useEffect, useState } from 'react';

export default function History({ refresh }) {
  const [codes, setCodes] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCodes();
  }, [refresh]);

  const fetchCodes = async () => {
    setLoading(true);
    try {
      const url = search 
        ? `/api/codes/list?search=${encodeURIComponent(search)}`
        : '/api/codes/list';
      
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.success) {
        setCodes(data.codes);
      }
    } catch (error) {
      console.error('Fetch codes error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCodes();
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const deleteCode = async (id) => {
    if (!confirm('⚠️ هل أنت متأكد من حذف هذا الكود؟')) return;

    try {
      const res = await fetch(`/api/codes/delete?id=${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (data.success) {
        alert('✅ تم حذف الكود بنجاح');
        fetchCodes();
      } else {
        alert('❌ ' + data.error);
      }
    } catch (error) {
      alert('❌ خطأ في الاتصال بالخادم');
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    alert('✅ تم نسخ الكود!');
  };

  const exportCSV = () => {
    if (codes.length === 0) {
      alert('⚠️ لا توجد بيانات للتصدير!');
      return;
    }

    const headers = ['الاسم', 'الهاتف', 'Machine ID', 'النوع', 'الكود', 'التاريخ', 'الانتهاء', 'ملاحظات'];
    const rows = codes.map(c => [
      c.client_name,
      c.client_phone,
      c.machine_id,
      c.type === 'full' ? 'كامل' : `تجريبي (${c.trial_days} أيام)`,
      c.activation_code,
      new Date(c.created_at).toLocaleDateString('ar-DZ'),
      c.expiry_date ? new Date(c.expiry_date).toLocaleDateString('ar-DZ') : '-',
      c.notes || '-'
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `activation_history_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    alert('✅ تم تصدير السجل بنجاح!');
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 border-2 border-orange-500/30">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-orange-400 flex items-center gap-2">
          📚 سجل الأكواد
        </h2>
        
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          <input
            type="text"
            value={search}
            onChange={handleSearch}
            placeholder="🔍 بحث..."
            className="px-4 py-2 bg-gray-700 border-2 border-orange-500/30 rounded-lg text-white focus:border-orange-500 focus:outline-none"
          />
          <button
            onClick={exportCSV}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-bold transition-all"
          >
            📥 تصدير CSV
          </button>
        </div>
      </div>

      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {loading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-orange-500"></div>
            <p className="text-gray-400 mt-4">جاري التحميل...</p>
          </div>
        ) : codes.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            📭 لا توجد أكواد
            {search && <div className="mt-2">جرّب البحث بكلمة أخرى</div>}
          </div>
        ) : (
          codes.map((code) => (
            <HistoryItem 
              key={code.id} 
              code={code} 
              onDelete={deleteCode}
              onCopy={copyCode}
            />
          ))
        )}
      </div>
    </div>
  );
}

function HistoryItem({ code, onDelete, onCopy }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-DZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-gray-700/50 border border-orange-500/30 rounded-lg p-4 hover:bg-gray-700 transition-all">
      <div className="flex flex-col md:flex-row justify-between items-start gap-3">
        <div className="flex-1 w-full">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-orange-400 font-bold text-lg">{code.client_name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  code.type === 'full' 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-green-500 text-white'
                }`}>
                  {code.type === 'full' ? '💎 كامل' : `⏰ ${code.trial_days} أيام`}
                </span>
                {code.is_used && (
                  <span className="px-2 py-1 rounded text-xs font-bold bg-purple-500 text-white">
                    ✅ مستخدم
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-300 space-y-1 mb-3">
            <div>📱 {code.client_phone}</div>
            <div>🖥️ {code.machine_id}</div>
            <div>📅 {formatDate(code.created_at)}</div>
            {code.expiry_date && (
              <div className="text-yellow-400">⏰ ينتهي: {new Date(code.expiry_date).toLocaleDateString('ar-DZ')}</div>
            )}
            {code.notes && (
              <div className="text-gray-400">📝 {code.notes}</div>
            )}
          </div>

          <div className="bg-gray-900 p-2 rounded font-mono text-sm text-blue-400 mb-3 break-all">
            {code.activation_code}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onCopy(code.activation_code)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm font-bold transition-all"
            >
              📋 نسخ
            </button>
            <button
              onClick={() => onDelete(code.id)}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-bold transition-all"
            >
              🗑️ حذف
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

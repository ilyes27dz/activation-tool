'use client';
import { useEffect, useState } from 'react';

export default function Stats() {
  const [stats, setStats] = useState({ total: 0, used: 0, unused: 0, trial: 0, full: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/codes/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 border-2 border-orange-500/30">
        <p className="text-gray-400">⏳ جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <StatCard icon="📊" label="إجمالي الأكواد" value={stats.total} color="blue" />
      <StatCard icon="✅" label="مستخدم" value={stats.used} color="green" />
      <StatCard icon="⏳" label="غير مستخدم" value={stats.unused} color="yellow" />
      <StatCard icon="🎁" label="تجريبي" value={stats.trial} color="purple" />
      <StatCard icon="💎" label="كامل" value={stats.full} color="orange" />
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  const colors = {
    blue: 'border-blue-500/30 bg-blue-500/10',
    green: 'border-green-500/30 bg-green-500/10',
    yellow: 'border-yellow-500/30 bg-yellow-500/10',
    purple: 'border-purple-500/30 bg-purple-500/10',
    orange: 'border-orange-500/30 bg-orange-500/10',
  };

  return (
    <div className={`${colors[color]} border-2 rounded-xl p-4 text-center`}>
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-xs text-gray-400 mt-1">{label}</div>
    </div>
  );
}

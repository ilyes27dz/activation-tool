// components/Stats.jsx
'use client';
import { useEffect, useState } from 'react';

export default function Stats() {
  const [stats, setStats] = useState({ total: 0, full: 0, trial: 0, used: 0 });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/codes/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Fetch stats error:', error);
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <StatCard 
        icon="📈" 
        title="إجمالي الأكواد" 
        value={stats.total} 
        color="bg-blue-500"
      />
      <StatCard 
        icon="💎" 
        title="كامل" 
        value={stats.full} 
        color="bg-orange-500"
      />
      <StatCard 
        icon="⏰" 
        title="تجريبي" 
        value={stats.trial} 
        color="bg-green-500"
      />
      <StatCard 
        icon="✅" 
        title="مستخدم" 
        value={stats.used} 
        color="bg-purple-500"
      />
    </div>
  );
}

function StatCard({ icon, title, value, color }) {
  return (
    <div className={`${color} rounded-xl p-4 text-white shadow-lg`}>
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-2xl font-bold mb-1">{value}</div>
      <div className="text-sm opacity-90">{title}</div>
    </div>
  );
}

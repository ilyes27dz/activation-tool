// app/page.js
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Stats from '@/components/Stats';
import Generator from '@/components/Generator';
import History from '@/components/History';

export default function HomePage() {
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // التحقق من تسجيل الدخول
    const isAuth = localStorage.getItem('isAuthenticated');
    if (!isAuth) {
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    router.push('/login');
  };

  const handleCodeGenerated = () => {
    // تحديث الإحصائيات والسجل
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 md:p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-800 rounded-xl p-4 border-2 border-orange-500/30">
          <div className="flex items-center gap-4">
            <div className="text-5xl">🔑</div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-orange-400">أداة التفعيل</h1>
              <p className="text-gray-400 text-sm">HANOUTY DZ - نسخة احترافية</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-bold transition-all"
          >
            🚪 تسجيل خروج
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Stats */}
        <Stats key={`stats-${refreshKey}`} />

        {/* Generator + History */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Generator onCodeGenerated={handleCodeGenerated} />
          <History refresh={refreshKey} />
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-gray-500 text-xs mt-8">
        © 2025 HANOUTY DZ - أداة خاصة للمطور فقط | لا تشارك هذه الأداة مع أحد!
      </div>
    </div>
  );
}

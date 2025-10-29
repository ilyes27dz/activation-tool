'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem('isAuthenticated', 'true');
        router.push('/');
      } else {
        setError(data.error || 'خطأ في تسجيل الدخول');
      }
    } catch (error) {
      setError('خطأ في الاتصال بالخادم');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl border-2 border-orange-500 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🔑</div>
          <h1 className="text-3xl font-bold text-orange-400 mb-2">أداة التفعيل</h1>
          <p className="text-gray-400">HANOUTY DZ</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-orange-400 text-sm font-bold mb-2">
              اسم المستخدم
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border-2 border-orange-500/30 rounded-lg text-white focus:border-orange-500 focus:outline-none"
              placeholder="admin"
              required
            />
          </div>

          <div>
            <label className="block text-orange-400 text-sm font-bold mb-2">
              كلمة المرور
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border-2 border-orange-500/30 rounded-lg text-white focus:border-orange-500 focus:outline-none"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-2 rounded-lg text-sm">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-105"
          >
            🔓 دخول
          </button>
        </form>

        <p className="text-center text-gray-500 text-xs mt-6">
          © 2025 HANOUTY DZ - أداة خاصة
        </p>
      </div>
    </div>
  );
}

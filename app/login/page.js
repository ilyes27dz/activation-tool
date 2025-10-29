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
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logo}>🔑</div>
          <h1 style={styles.title}>أداة التفعيل</h1>
          <p style={styles.subtitle}>HANOUTY DZ</p>
        </div>

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>اسم المستخدم</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
              placeholder="admin"
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>كلمة المرور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div style={styles.error}>
              ⚠️ {error}
            </div>
          )}

          <button type="submit" style={styles.button}>
            🔓 دخول
          </button>
        </form>

        <p style={styles.footer}>
          © 2025 HANOUTY DZ - أداة خاصة
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  card: {
    background: 'rgba(18, 30, 40, 0.95)',
    borderRadius: '20px',
    padding: '40px',
    maxWidth: '400px',
    width: '100%',
    boxShadow: '0 8px 32px rgba(255, 152, 0, 0.3)',
    border: '2px solid rgba(255, 152, 0, 0.3)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  logo: {
    width: '80px',
    height: '80px',
    margin: '0 auto 20px',
    background: 'linear-gradient(135deg, #FF9800 0%, #FF6F00 100%)',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '45px',
    boxShadow: '0 10px 25px rgba(255, 152, 0, 0.5)',
  },
  title: {
    color: '#FFD54F',
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '10px',
  },
  subtitle: {
    color: '#B0BEC5',
    fontSize: '14px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    color: '#FFD54F',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    padding: '12px',
    fontSize: '14px',
    border: '2px solid rgba(255, 152, 0, 0.4)',
    borderRadius: '8px',
    background: 'rgba(255, 152, 0, 0.08)',
    color: '#FFD54F',
    outline: 'none',
  },
  button: {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '8px',
    background: '#FF9800',
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  error: {
    background: 'rgba(244, 67, 54, 0.2)',
    border: '1px solid #f44336',
    color: '#ff5252',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '14px',
  },
  footer: {
    textAlign: 'center',
    color: '#78909C',
    fontSize: '12px',
    marginTop: '20px',
  },
};

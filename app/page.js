'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const isAuth = localStorage.getItem('isAuthenticated');
    if (!isAuth) {
      router.push('/login');
      return;
    }

    // Redirect to HTML tool
    window.location.href = '/tool/index.html';
  }, [router]);

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '60px', marginBottom: '20px' }}>🔑</div>
        <p style={{ color: '#FFD54F', fontSize: '20px', fontWeight: 'bold' }}>
          ⏳ جاري التحميل...
        </p>
      </div>
    </div>
  );
}

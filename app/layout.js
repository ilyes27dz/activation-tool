// app/layout.js
import './globals.css';

export const metadata = {
  title: 'أداة التفعيل - HANOUTY DZ',
  description: 'أداة احترافية لتوليد أكواد التفعيل',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="antialiased">{children}</body>
    </html>
  );
}

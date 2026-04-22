import './globals.css';
import Navbar from './components/Navbar';

export const metadata = {
  title: 'DentCare - Шүдний эмнэлэг',
  description: 'Мэргэжлийн шүдний эмчилгээ, цаг захиалгын систем',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="mn" data-scroll-behavior="smooth">
      <body>
        <Navbar />
        <main className="min-h-screen bg-gray-50">
          {children}
        </main>
        <footer className="bg-gray-800 text-white text-center py-4">
          <p>© 2025 DentCare. Бүх эрх хуулиар хамгаалагдсан.</p>
        </footer>
      </body>
    </html>
  );
}
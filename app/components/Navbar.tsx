'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  HomeIcon,
  UserGroupIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  CalendarIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';

export default function Navbar() {
  const [user, setUser] = useState<{ username: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/');
  };

  // Хэрэглэгч нэвтрээгүй үед
  if (!user && !loading) {
    return (
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          {/* Лого - зөвхөн текст */}
          <Link href="/" className="text-2xl font-bold text-teal-600">
            DentCare
          </Link>
          
          {/* Үндсэн холбоосууд */}
          <div className="hidden md:flex space-x-6">
            <Link href="/" className="flex items-center gap-1 text-gray-700 hover:text-teal-600">
              <HomeIcon className="w-5 h-5" /> Нүүр
            </Link>
            <Link href="/doctors" className="flex items-center gap-1 text-gray-700 hover:text-teal-600">
              <UserGroupIcon className="w-5 h-5" /> Эмч нар
            </Link>
            <Link href="/services" className="flex items-center gap-1 text-gray-700 hover:text-teal-600">
              <CogIcon className="w-5 h-5" /> Үйлчилгээ
            </Link>
          </div>

          {/* Нэвтрэх/Бүртгүүлэх */}
        <div className="space-x-3">
  <Link href="/login" className="text-gray-700 hover:text-teal-600 transition">
    Нэвтрэх
  </Link>
  <Link 
    href="/register" 
    className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-4 py-2 rounded-lg hover:from-teal-700 hover:to-cyan-700 transition shadow-md"
  >
    Бүртгүүлэх
  </Link>
</div>
        </div>
      </nav>
    );
  }

  // Хэрэглэгч нэвтэрсэн үед
  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Лого - зөвхөн текст */}
        <Link href="/" className="text-2xl font-bold text-teal-600">
          DentCare
        </Link>
        
        {/* Үндсэн холбоосууд */}
        <div className="hidden md:flex space-x-6">
          <Link href="/" className="flex items-center gap-1 text-gray-700 hover:text-teal-600">
            <HomeIcon className="w-5 h-5" /> Нүүр
          </Link>
          <Link href="/doctors" className="flex items-center gap-1 text-gray-700 hover:text-teal-600">
            <UserGroupIcon className="w-5 h-5" /> Эмч нар
          </Link>
          <Link href="/services" className="flex items-center gap-1 text-gray-700 hover:text-teal-600">
            <CogIcon className="w-5 h-5" /> Үйлчилгээ
          </Link>
        </div>

        {/* Баруун талын хэсэг */}
        <div className="flex items-center space-x-4">
          {/* Хэрэглэгчийн нэр - Профайл руу чиглүүлэх */}
          <Link 
            href={user?.role === 'patient' ? '/dashboard/profile' : user?.role === 'doctor' ? '/doctor/profile' : '#'} 
            className="text-gray-700 text-sm flex items-center gap-1 hover:text-teal-600 transition"
          >
            <UserCircleIcon className="w-5 h-5" />
            {user?.username}
          </Link>

          {/* Өвчтөний захиалгын холбоос */}
          {user?.role === 'patient' && (
            <Link href="/dashboard" className="flex items-center gap-1 text-gray-700 hover:text-teal-600">
              <ClipboardDocumentListIcon className="w-5 h-5" /> Миний захиалга
            </Link>
          )}

          {/* Эмчийн холбоос */}
          {user?.role === 'doctor' && (
            <Link href="/doctor/dashboard" className="flex items-center gap-1 text-gray-700 hover:text-teal-600">
              <CalendarIcon className="w-5 h-5" /> Самбар
            </Link>
          )}

          {/* Админы холбоос */}
          {user?.role === 'admin' && (
            <Link href="/admin" className="flex items-center gap-1 text-gray-700 hover:text-teal-600">
              <ChartBarIcon className="w-5 h-5" /> Админ
            </Link>
          )}

          {/* Гарах товч */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-red-600 hover:text-red-700 text-sm"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            Гарах
          </button>
        </div>
      </div>
    </nav>
  );
}
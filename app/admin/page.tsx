'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { 
  ClipboardDocumentListIcon, 
  UserGroupIcon, 
  CogIcon, 
  UsersIcon,
  CalendarIcon,
  ChartBarIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const [stats, setStats] = useState({ 
    appointments: 0, 
    doctors: 0, 
    services: 0, 
    patients: 0 
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto">
        {/* Буцах товч */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-gray-500 hover:text-teal-600 transition mb-4 group"
          aria-label="Буцах"
        >
          <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Буцах</span>
        </button>

        <div className="flex items-center gap-3 mb-6">
          <ChartBarIcon className="w-8 h-8 text-teal-600" />
          <h1 className="text-2xl font-bold text-gray-800">Админ хяналтын самбар</h1>
        </div>
        <p className="text-gray-600 mb-6">Тавтай морил, admin!</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Захиалгууд */}
          <Link href="/admin/appointments" className="block bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition group">
            <ClipboardDocumentListIcon className="w-10 h-10 text-teal-600 group-hover:scale-110 transition" />
            <h2 className="text-lg font-semibold text-gray-800 mt-3">Захиалгууд</h2>
            <p className="text-3xl font-bold text-teal-600 mt-2">{stats.appointments}</p>
            <p className="text-sm text-gray-500 mt-1">Бүх захиалгыг харах</p>
          </Link>

          {/* Эмч нар */}
          <Link href="/admin/doctors" className="block bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition group">
            <UserGroupIcon className="w-10 h-10 text-teal-600 group-hover:scale-110 transition" />
            <h2 className="text-lg font-semibold text-gray-800 mt-3">Эмч нар</h2>
            <p className="text-3xl font-bold text-teal-600 mt-2">{stats.doctors}</p>
            <p className="text-sm text-gray-500 mt-1">Бүх эмчийн жагсаалт</p>
          </Link>

          {/* Үйлчилгээнүүд */}
          <Link href="/admin/services" className="block bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition group">
            <CogIcon className="w-10 h-10 text-teal-600 group-hover:scale-110 transition" />
            <h2 className="text-lg font-semibold text-gray-800 mt-3">Үйлчилгээнүүд</h2>
            <p className="text-3xl font-bold text-teal-600 mt-2">{stats.services}</p>
            <p className="text-sm text-gray-500 mt-1">Бүх үйлчилгээний жагсаалт</p>
          </Link>

          {/* Өвчтөнүүд */}
          <Link href="/admin/patients" className="block bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition group">
            <UsersIcon className="w-10 h-10 text-teal-600 group-hover:scale-110 transition" />
            <h2 className="text-lg font-semibold text-gray-800 mt-3">Өвчтөнүүд</h2>
            <p className="text-3xl font-bold text-teal-600 mt-2">{stats.patients}</p>
            <p className="text-sm text-gray-500 mt-1">Бүх өвчтөний жагсаалт</p>
          </Link>

          {/* Ажлын хуваарь */}
          <Link href="/admin/schedules" className="block bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition group">
            <CalendarIcon className="w-10 h-10 text-teal-600 group-hover:scale-110 transition" />
            <h2 className="text-lg font-semibold text-gray-800 mt-3">Ажлын хуваарь</h2>
            <p className="text-3xl font-bold text-teal-600 mt-2"></p>
            <p className="text-sm text-gray-500 mt-1">Эмчийн цагийн хуваарийг харах, өөрчлөх</p>
          </Link>

          {/* Статистик */}
          <Link href="/admin/statistics" className="block bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition group">
            <ChartBarIcon className="w-10 h-10 text-teal-600 group-hover:scale-110 transition" />
            <h2 className="text-lg font-semibold text-gray-800 mt-3">Статистик</h2>
            <p className="text-3xl font-bold text-teal-600 mt-2"></p>
            <p className="text-sm text-gray-500 mt-1">Эмчийн үзлэгийн тоо, ачаалалтай өдөр, цаг</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
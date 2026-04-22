'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { 
  ChartBarIcon, 
  CalendarIcon, 
  ClockIcon, 
  UserGroupIcon,
  CheckIcon 
} from '@heroicons/react/24/outline';

interface DoctorStat {
  doctor_id: number;
  first_name: string;
  last_name: string;
  specialization: string;
  total_appointments: number;
  completed_count: number;
}

export default function AdminStatisticsPage() {
  const [doctorStats, setDoctorStats] = useState<DoctorStat[]>([]);
  const [busyDay, setBusyDay] = useState<{ date: string; appointment_count: number } | null>(null);
  const [busyHour, setBusyHour] = useState<{ hour: number; appointment_count: number } | null>(null);
  const [monthlyStats, setMonthlyStats] = useState<{ month: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/admin/statistics')
      .then(res => {
        if (res.status === 401) {
          router.push('/admin/login');
          return;
        }
        return res.json();
      })
      .then(data => {
        setDoctorStats(data.doctorStats || []);
        setBusyDay(data.busyDay);
        setBusyHour(data.busyHour);
        setMonthlyStats(data.monthlyStats || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Statistics error:', err);
        setLoading(false);
      });
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  const maxCount = monthlyStats.length > 0 ? Math.max(...monthlyStats.map(s => s.count)) : 1;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white">
        <div className="container mx-auto px-4 py-6">
           <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-gray-500 hover:text-teal-600 transition group"
          aria-label="Буцах"
        >
          <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Буцах</span>
        </button>
          <div className="flex items-center gap-3">
            <ChartBarIcon className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">Статистик тайлан</h1>
              <p className="opacity-90 mt-1">Эмнэлгийн үйл ажиллагааны дүн шинжилгээ</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Ачаалалтай өдөр, цаг - бүдэг натурал өнгө */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 rounded-2xl shadow-md p-6">
            <div className="flex items-center gap-2 mb-2">
              <CalendarIcon className="w-6 h-6 text-amber-600" />
              <h2 className="text-lg font-semibold">Хамгийн ачаалалтай өдөр</h2>
            </div>
            {busyDay ? (
              <div>
                <p className="text-3xl font-bold mt-2">{new Date(busyDay.date).toLocaleDateString('mn-MN')}</p>
                <p className="text-sm text-amber-600">{busyDay.appointment_count} захиалга</p>
              </div>
            ) : (
              <p className="mt-2">Мэдээлэл байхгүй</p>
            )}
          </div>
          <div className="bg-gradient-to-r from-sky-100 to-blue-100 text-sky-800 rounded-2xl shadow-md p-6">
            <div className="flex items-center gap-2 mb-2">
              <ClockIcon className="w-6 h-6 text-sky-600" />
              <h2 className="text-lg font-semibold">Хамгийн ачаалалтай цаг</h2>
            </div>
            {busyHour ? (
              <div>
                <p className="text-3xl font-bold mt-2">{busyHour.hour}:00 - {busyHour.hour + 1}:00</p>
                <p className="text-sm text-sky-600">{busyHour.appointment_count} захиалга</p>
              </div>
            ) : (
              <p className="mt-2">Мэдээлэл байхгүй</p>
            )}
          </div>
        </div>

        {/* Эмч бүрийн статистик */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden mb-8">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <div className="flex items-center gap-2">
              <UserGroupIcon className="w-5 h-5 text-teal-600" />
              <h2 className="font-semibold text-lg">Эмч бүрийн үзлэгийн тоо</h2>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left">Эмч</th>
                  <th className="px-4 py-3 text-left">Мэргэжил</th>
                  <th className="px-4 py-3 text-center">Нийт захиалга</th>
                  <th className="px-4 py-3 text-center">Дууссан</th>
                  <th className="px-4 py-3 text-center">Гүйцэтгэл</th>
                </tr>
              </thead>
              <tbody>
                {doctorStats.map((doc) => {
                  const total = doc.total_appointments || 0;
                  const completed = doc.completed_count || 0;
                  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
                  return (
                    <tr key={doc.doctor_id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">Dr. {doc.first_name} {doc.last_name}</td>
                      <td className="px-4 py-3 text-gray-500">{doc.specialization}</td>
                      <td className="px-4 py-3 text-center font-semibold">{total}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center gap-1 text-green-600">
                          <CheckIcon className="w-4 h-4" />
                          {completed}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-teal-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-gray-600 min-w-[40px]">{percent}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Сарын статистик */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <div className="flex items-center gap-2">
              <ChartBarIcon className="w-5 h-5 text-teal-600" />
              <h2 className="font-semibold text-lg">Сарын захиалгын тоо</h2>
            </div>
          </div>
          <div className="p-6">
            {monthlyStats.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ChartBarIcon className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                <p>Мэдээлэл байхгүй байна</p>
              </div>
            ) : (
              <div className="space-y-3">
                {monthlyStats.map((stat) => {
                  const barWidth = maxCount > 0 ? (stat.count / maxCount) * 100 : 0;
                  return (
                    <div key={stat.month} className="flex items-center gap-3">
                      <div className="w-24 text-sm font-medium text-gray-700">{stat.month}</div>
                      <div className="flex-1">
                        <div className="bg-teal-100 rounded-full h-8 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-teal-400 to-teal-500 h-8 rounded-full flex items-center justify-end px-3 text-sm font-semibold text-white transition-all duration-500"
                            style={{ width: `${barWidth}%` }}
                          >
                            {stat.count > 0 && stat.count}
                          </div>
                        </div>
                      </div>
                      <div className="w-12 text-right font-semibold text-gray-700">{stat.count}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BackButton from '../../components/BackButton';
interface DoctorStat {
  doctor_id: number;
  first_name: string;
  last_name: string;
  specialization: string;
  total_appointments: number;
  completed_count: number;
}

interface BusyPeriod {
  date: string;
  appointment_count: number;
}

interface MonthlyStat {
  month: string;
  count: number;
}

export default function AdminStatisticsPage() {
  const [doctorStats, setDoctorStats] = useState<DoctorStat[]>([]);
  const [busyDay, setBusyDay] = useState<BusyPeriod | null>(null);
  const [busyHour, setBusyHour] = useState<{ hour: number; appointment_count: number } | null>(null);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStat[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/doctor/statistics')
      .then(res => {
        if (res.status === 401) router.push('/admin/login');
        return res.json();
      })
      .then(data => {
        setDoctorStats(data.doctorStats || []);
        setBusyDay(data.busyDay);
        setBusyHour(data.busyHour);
        setMonthlyStats(data.monthlyStats || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Гүйцэтгэлийн хувийг тооцоолох
  const getPercentage = (total: number, completed: number) => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  // Хамгийн их утгыг олох
  const getMaxCount = (stats: MonthlyStat[]) => {
    if (stats.length === 0) return 1;
    return Math.max(...stats.map(s => s.count));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Уншиж байна...</p>
        </div>
      </div>
    );
  }

  const maxMonthlyCount = getMaxCount(monthlyStats);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white">
        <div className="container mx-auto px-4 py-6">
            <BackButton fallbackUrl="/doctor/dashboard" />
          <h1 className="text-2xl font-bold"> Статистик тайлан</h1>
          <p className="opacity-90 mt-1">Эмнэлгийн үйл ажиллагааны дүн шинжилгээ</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Ачаалалтай өдөр, цаг */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-semibold opacity-90"> Хамгийн ачаалалтай өдөр</h2>
            {busyDay ? (
              <>
                <p className="text-3xl font-bold mt-2">{new Date(busyDay.date).toLocaleDateString('mn-MN')}</p>
                <p className="text-sm opacity-80">{busyDay.appointment_count} захиалга</p>
              </>
            ) : (
              <p className="mt-2">Мэдээлэл байхгүй</p>
            )}
          </div>
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-semibold opacity-90"> Хамгийн ачаалалтай цаг</h2>
            {busyHour ? (
              <>
                <p className="text-3xl font-bold mt-2">{busyHour.hour}:00 - {busyHour.hour + 1}:00</p>
                <p className="text-sm opacity-80">{busyHour.appointment_count} захиалга</p>
              </>
            ) : (
              <p className="mt-2">Мэдээлэл байхгүй</p>
            )}
          </div>
        </div>

        {/* Эмч бүрийн статистик */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h2 className="font-semibold text-lg"> Эмч бүрийн үзлэгийн тоо</h2>
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
                  const percentage = getPercentage(doc.total_appointments, doc.completed_count);
                  return (
                    <tr key={doc.doctor_id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">Dr. {doc.first_name} {doc.last_name}</td>
                      <td className="px-4 py-3 text-gray-500">{doc.specialization}</td>
                      <td className="px-4 py-3 text-center font-semibold">{doc.total_appointments}</td>
                      <td className="px-4 py-3 text-center text-green-600">{doc.completed_count}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-teal-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-gray-600 min-w-[40px]">{percentage}%</span>
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
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h2 className="font-semibold text-lg"> Сарын захиалгын тоо</h2>
          </div>
          <div className="p-6">
            {monthlyStats.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📭</div>
                <p>Мэдээлэл байхгүй байна</p>
              </div>
            ) : (
              <div className="space-y-3">
                {monthlyStats.map((stat) => {
                  const barWidth = maxMonthlyCount > 0 ? (stat.count / maxMonthlyCount) * 100 : 0;
                  return (
                    <div key={stat.month} className="flex items-center gap-3">
                      <div className="w-24 text-sm font-medium text-gray-700">{stat.month}</div>
                      <div className="flex-1">
                        <div className="bg-teal-100 rounded-full h-8 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-teal-500 to-cyan-500 h-8 rounded-full flex items-center justify-end px-3 text-sm font-semibold text-white transition-all duration-500"
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
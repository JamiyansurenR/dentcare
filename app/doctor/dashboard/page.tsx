'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import BackButton from '../../components/BackButton';
import { 
  CalendarIcon, 
  ChartBarIcon, 
  UserCircleIcon,
  ClipboardDocumentListIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

interface Appointment {
  appointment_id: number;
  patient_first_name: string;
  patient_last_name: string;
  patient_email: string;
  patient_phone: string;
  service_name: string;
  price: number;
  date: string;
  time: string;
  status: string;
}

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [doctorName, setDoctorName] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetch('/api/doctor/appointments')
      .then(res => {
        if (res.status === 401) router.push('/doctor/login');
        return res.json();
      })
      .then(data => {
        if (data.doctorName) setDoctorName(data.doctorName);
        setAppointments(data.appointments || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const updateStatus = async (appointmentId: number, newStatus: string) => {
    const res = await fetch('/api/doctor/appointments', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appointmentId, status: newStatus }),
    });
    if (res.ok) {
      setAppointments(prev =>
        prev.map(apt =>
          apt.appointment_id === appointmentId ? { ...apt, status: newStatus } : apt
        )
      );
    } else {
      alert('Алдаа гарлаа');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Хүлээгдэж буй';
      case 'confirmed': return 'Баталгаажсан';
      case 'cancelled': return 'Цуцлагдсан';
      case 'completed': return 'Дууссан';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <ClockIcon className="w-4 h-4 inline mr-1" />;
      case 'confirmed': return <CheckIcon className="w-4 h-4 inline mr-1" />;
      case 'cancelled': return <XMarkIcon className="w-4 h-4 inline mr-1" />;
      case 'completed': return <CheckIcon className="w-4 h-4 inline mr-1" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  const total = appointments.length;
  const pending = appointments.filter(a => a.status === 'pending').length;
  const confirmed = appointments.filter(a => a.status === 'confirmed').length;
  const completed = appointments.filter(a => a.status === 'completed').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white">
        <div className="container mx-auto px-4 py-6">
            <BackButton fallbackUrl="/doctor/dashboard" />
          <div className="flex items-center gap-3">
            <UserCircleIcon className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">Эмчийн хяналтын самбар</h1>
              <p className="opacity-90 mt-1">Тавтай морил, {doctorName || 'эмч'}!</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Товч мэдээлэл */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <ClipboardDocumentListIcon className="w-8 h-8 mx-auto text-teal-600 mb-2" />
            <div className="text-2xl font-bold text-gray-800">{total}</div>
            <div className="text-sm text-gray-500">Нийт захиалга</div>
          </div>
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <ClockIcon className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
            <div className="text-2xl font-bold text-yellow-600">{pending}</div>
            <div className="text-sm text-gray-500">Хүлээгдэж буй</div>
          </div>
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <CheckIcon className="w-8 h-8 mx-auto text-green-500 mb-2" />
            <div className="text-2xl font-bold text-green-600">{confirmed}</div>
            <div className="text-sm text-gray-500">Баталгаажсан</div>
          </div>
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <ClipboardDocumentListIcon className="w-8 h-8 mx-auto text-blue-500 mb-2" />
            <div className="text-2xl font-bold text-blue-600">{completed}</div>
            <div className="text-sm text-gray-500">Дууссан</div>
          </div>
        </div>

        {/* Холбоосууд */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link href="/doctor/schedules" className="bg-white rounded-xl shadow p-4 hover:shadow-lg transition text-center group">
            <CalendarIcon className="w-10 h-10 mx-auto text-teal-600 group-hover:scale-110 transition" />
            <h3 className="font-semibold mt-2">Ажлын хуваарь</h3>
            <p className="text-sm text-gray-500">Цагийн хуваариа харах, засах</p>
          </Link>
          
          <Link href="/doctor/statistics" className="bg-white rounded-xl shadow p-4 hover:shadow-lg transition text-center group">
            <ChartBarIcon className="w-10 h-10 mx-auto text-teal-600 group-hover:scale-110 transition" />
            <h3 className="font-semibold mt-2">Миний статистик</h3>
            <p className="text-sm text-gray-500">Үзлэгийн тоо, гүйцэтгэл</p>
          </Link>
          
          <Link href="/doctor/profile" className="bg-white rounded-xl shadow p-4 hover:shadow-lg transition text-center group">
            <UserCircleIcon className="w-10 h-10 mx-auto text-teal-600 group-hover:scale-110 transition" />
            <h3 className="font-semibold mt-2">Миний профайл</h3>
            <p className="text-sm text-gray-500">Мэдээллээ засварлах</p>
          </Link>
        </div>

        {/* Захиалгын жагсаалт */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <ClipboardDocumentListIcon className="w-5 h-5 text-teal-600" />
              Миний захиалгууд
            </h2>
          </div>
          {appointments.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Захиалга байхгүй байна</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 text-left">Өвчтөн</th>
                    <th className="p-3 text-left">Үйлчилгээ</th>
                    <th className="p-3 text-left">Огноо</th>
                    <th className="p-3 text-left">Цаг</th>
                    <th className="p-3 text-left">Үнэ</th>
                    <th className="p-3 text-left">Төлөв</th>
                    <th className="p-3 text-left">Үйлдэл</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((apt) => (
                    <tr key={apt.appointment_id} className="border-t hover:bg-gray-50">
                      <td className="p-3">
                        <div>{apt.patient_first_name} {apt.patient_last_name}</div>
                        <div className="text-xs text-gray-500">{apt.patient_phone}</div>
                      </td>
                      <td className="p-3">{apt.service_name}</td>
                      <td className="p-3">{new Date(apt.date).toLocaleDateString('mn-MN')}</td>
                      <td className="p-3">{apt.time.substring(0, 5)}</td>
                      <td className="p-3 flex items-center gap-1 text-teal-600 font-semibold">
                        <CurrencyDollarIcon className="w-4 h-4" />
                        {apt.price.toLocaleString(undefined, { minimumFractionDigits: 0 })}₮
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 text-xs rounded-full inline-flex items-center ${getStatusColor(apt.status)}`}>
                          {getStatusIcon(apt.status)}
                          {getStatusText(apt.status)}
                        </span>
                      </td>
                      <td className="p-3">
                        <select
                          value={apt.status}
                          onChange={(e) => updateStatus(apt.appointment_id, e.target.value)}
                          className="text-sm border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-teal-500"
                          aria-label="Төлөв өөрчлөх"
                        >
                          <option value="pending">Хүлээгдэж буй</option>
                          <option value="confirmed">Баталгаажсан</option>
                          <option value="cancelled">Цуцлагдсан</option>
                          <option value="completed">Дууссан</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
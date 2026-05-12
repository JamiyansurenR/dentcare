'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import BackButton from '../components/BackButton';
import { 
  ClipboardDocumentListIcon, 
  CalendarIcon, 
  ClockIcon,
  CurrencyDollarIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  UserCircleIcon ,
   StarIcon 
} from '@heroicons/react/24/outline';

interface Appointment {
  appointment_id: number;
  doctor_id: number;
  doctor_first_name: string;
  doctor_last_name: string;
  specialization: string;
  service_id: number;
  service_name: string;
  price: number;
  date: string;
  time: string;
  status: string;
  schedule_id: number;
  created_at: string;
}

export default function DashboardPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState<number | null>(null);
   const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const router = useRouter();

  const fetchAppointments = async () => {
    try {
      const res = await fetch('/api/appointments/user');
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      if (res.ok) {
        setAppointments(data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Серверт холбогдоход алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = async (appointmentId: number, scheduleId: number) => {
    if (!confirm('Та энэ захиалгыг цуцлахдаа итгэлтэй байна уу?')) return;
    
    setCancelling(appointmentId);
    
    try {
      const res = await fetch('/api/appointments/cancel', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId, scheduleId }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        alert('Захиалга амжилттай цуцлагдлаа');
        fetchAppointments();
      } else {
        alert(data.error || 'Цуцлахад алдаа гарлаа');
      }
    } catch (error) {
      alert('Серверт холбогдоход алдаа гарлаа');
    } finally {
      setCancelling(null);
    }
  };
const openReviewModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setReviewRating(5);
    setReviewComment('');
    setShowReviewModal(true);
  };

  const submitReview = async () => {
    if (!selectedAppointment) return;
    
    setSubmittingReview(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: selectedAppointment.appointment_id,
          rating: reviewRating,
          comment: reviewComment
        })
      });
      
      if (res.ok) {
        alert('Үнэлгээ амжилттай хадгалагдлаа. Баярлалаа!');
        setShowReviewModal(false);
        fetchAppointments(); // жагсаалтыг шинэчлэх
      } else {
        const data = await res.json();
        alert(data.error || 'Үнэлгээ хадгалахад алдаа гарлаа');
      }
    } catch (err) {
      alert('Серверт холбогдоход алдаа гарлаа');
    } finally {
      setSubmittingReview(false);
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
      case 'pending': return <ExclamationTriangleIcon className="w-4 h-4 inline mr-1" />;
      case 'confirmed': return <CheckIcon className="w-4 h-4 inline mr-1" />;
      case 'cancelled': return <XMarkIcon className="w-4 h-4 inline mr-1" />;
      case 'completed': return <CheckIcon className="w-4 h-4 inline mr-1" />;
      default: return null;
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Уншиж байна...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Буцах товч */}
       
<BackButton fallbackUrl="/doctors" />
        {/* Гарчиг */}
        <div className="flex items-center gap-3 mb-6">
          <ClipboardDocumentListIcon className="w-8 h-8 text-teal-600" />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Миний захиалга</h1>
        </div>
        <p className="text-gray-600 mb-6">Таны цаг захиалгын түүх</p>

        {/* Профайл засварлах товч */}
        <div className="flex justify-end mb-4">
         <Link href="/dashboard/profile" className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition text-sm">
  <UserCircleIcon className="w-4 h-4" />
  Профайл засварлах
</Link>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {appointments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <ClipboardDocumentListIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Захиалга байхгүй байна</h2>
            <p className="text-gray-500 mb-4">Та одоогоор ямар ч захиалга хийгээгүй байна.</p>
            <div className="flex gap-3 justify-center">
             <Link href="/doctors" className="flex items-center gap-2 bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition">
  <CalendarIcon className="w-4 h-4" />
  Цаг захиалах
</Link>
<Link href="/dashboard/profile" className="flex items-center gap-2 bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition">
  <UserCircleIcon className="w-4 h-4" />
  Профайл засварлах
</Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Эмч
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Үйлчилгээ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Огноо
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Цаг
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Үнэ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Төлөв
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Үйлдэл
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {appointments.map((apt) => (
                    <tr key={apt.appointment_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          Dr. {apt.doctor_first_name} {apt.doctor_last_name}
                        </div>
                        <div className="text-sm text-gray-500">{apt.specialization}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{apt.service_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {new Date(apt.date).toLocaleDateString('mn-MN')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <ClockIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{apt.time.substring(0, 5)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-sm font-semibold text-teal-600">
                          <CurrencyDollarIcon className="w-4 h-4" />
                          {apt.price.toLocaleString(undefined, { minimumFractionDigits: 0 })}₮
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full inline-flex items-center ${getStatusColor(apt.status)}`}>
                          {getStatusIcon(apt.status)}
                          {getStatusText(apt.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {apt.status === 'pending' && (
                          <button
                            onClick={() => cancelAppointment(apt.appointment_id, apt.schedule_id)}
                            disabled={cancelling === apt.appointment_id}
                            className="border border-red-400 text-red-500 hover:bg-red-50 px-3 py-1 rounded-md text-sm transition disabled:opacity-50"
                          >
                            {cancelling === apt.appointment_id ? 'Цуцлаж байна...' : 'Цуцлах'}
                          </button>
                        )}
                        {apt.status === 'cancelled' && (
                          <span className="text-gray-400 text-sm">Цуцлагдсан</span>
                        )}
                        {apt.status === 'completed' && (
                          <button
                            onClick={() => openReviewModal(apt)}
                            className="bg-yellow-200 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
                          >
                             Үнэлэх
                          </button>
                        )}
                        {apt.status !== 'pending' && apt.status !== 'cancelled' && (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
       {/*  ҮНЭЛГЭЭНИЙ MODAL */}
      {showReviewModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Эмчид үнэлгээ өгөх</h2>
            <p className="text-gray-600 mb-4">
              Dr. {selectedAppointment.doctor_first_name} {selectedAppointment.doctor_last_name}
            </p>
            
            {/* Оддын үнэлгээ */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Үнэлгээ</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="focus:outline-none"
                    aria-label={`${star} од`}
                  >
                    <StarIcon 
                      className={`w-8 h-8 ${star <= reviewRating ? 'text-yellow-400' : 'text-gray-300'}`}
                    />
                  </button>
                ))}
              </div>
            </div>
            
            {/* Сэтгэгдэл */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Сэтгэгдэл (заавал биш)</label>
              <textarea
                rows={3}
                className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Таны сэтгэгдэл..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={submitReview}
                disabled={submittingReview}
                className="flex-1 bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 disabled:opacity-50"
              >
                {submittingReview ? 'Илгээж байна...' : 'Үнэлэх'}
              </button>
              <button
                onClick={() => setShowReviewModal(false)}
                className="flex-1 bg-gray-300 py-2 rounded-lg hover:bg-gray-400"
              >
                Цуцлах
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    
  );
}
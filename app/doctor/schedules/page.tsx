'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import BackButton from '../../components/BackButton';
interface Schedule {
  schedule_id: number;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
}

export default function DoctorSchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newStartTime, setNewStartTime] = useState('');
  const [newEndTime, setNewEndTime] = useState('');
  const [adding, setAdding] = useState(false);
  const router = useRouter();

  const fetchSchedules = async () => {
    try {
      const res = await fetch('/api/doctor/schedules');
      if (res.status === 401) {
        router.push('/doctor/login');
        return;
      }
      const data = await res.json();
      if (res.ok) {
        setSchedules(data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Серверт холбогдоход алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  const addSchedule = async () => {
    if (!newDate || !newStartTime || !newEndTime) {
      alert('Бүх талбарыг бөглөнө үү');
      return;
    }
    setAdding(true);
    try {
      const res = await fetch('/api/doctor/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: newDate, startTime: newStartTime, endTime: newEndTime }),
      });
      const data = await res.json();
      if (res.ok) {
        alert('Хуваарь нэмэгдлээ');
        setNewDate('');
        setNewStartTime('');
        setNewEndTime('');
        fetchSchedules();
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('Алдаа гарлаа');
    } finally {
      setAdding(false);
    }
  };

  const deleteSchedule = async (scheduleId: number) => {
    if (!confirm('Устгахдаа итгэлтэй байна уу?')) return;
    try {
      const res = await fetch(`/api/doctor/schedules?scheduleId=${scheduleId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        alert('Устгагдлаа');
        fetchSchedules();
      } else {
        alert('Алдаа гарлаа');
      }
    } catch (err) {
      alert('Алдаа гарлаа');
    }
  };

  useEffect(() => {
    fetchSchedules();
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <BackButton fallbackUrl="/doctor/dashboard" />
        <div className="flex items-center gap-3 mb-6">
          <CalendarIcon className="w-8 h-8 text-teal-600" />
          <h1 className="text-2xl font-bold text-gray-800">Ажлын хуваарь</h1>
        </div>

        {/* Шинэ цаг нэмэх хэсэг */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <PlusIcon className="w-5 h-5 text-teal-600" />
            Шинэ цаг нэмэх
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Огноо</label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                aria-label="Огноо"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Эхлэх цаг</label>
              <input
                type="time"
                value={newStartTime}
                onChange={(e) => setNewStartTime(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                aria-label="Эхлэх цаг"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Дуусах цаг</label>
              <input
                type="time"
                value={newEndTime}
                onChange={(e) => setNewEndTime(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                aria-label="Дуусах цаг"
              />
            </div>
          </div>
          <button
            onClick={addSchedule}
            disabled={adding}
            className="mt-4 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 disabled:opacity-50 transition"
          >
            {adding ? 'Нэмж байна...' : 'Нэмэх'}
          </button>
        </div>

        {/* Хуваарийн жагсаалт */}
        {schedules.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-500">
            Хуваарь байхгүй байна. Дээрээс шинэ цаг нэмэх боломжтой.
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Огноо</th>
                  <th className="p-3 text-left">Эхлэх цаг</th>
                  <th className="p-3 text-left">Дуусах цаг</th>
                  <th className="p-3 text-left">Төлөв</th>
                  <th className="p-3 text-left">Үйлдэл</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((s) => (
                  <tr key={s.schedule_id} className="border-t hover:bg-gray-50">
                    <td className="p-3">{new Date(s.date).toLocaleDateString('mn-MN')}</td>
                    <td className="p-3">{s.start_time.substring(0, 5)}</td>
                    <td className="p-3">{s.end_time.substring(0, 5)}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${s.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {s.status === 'available' ? 'Боломжтой' : 'Захиалагдсан'}
                      </span>
                    </td>
                    <td className="p-3">
                      {s.status === 'available' && (
                        <button
                          onClick={() => deleteSchedule(s.schedule_id)}
                          className="text-red-500 hover:text-red-700"
                          aria-label="Устгах"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
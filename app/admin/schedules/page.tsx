'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
interface Schedule {
  schedule_id: number;
  doctor_id: number;
  first_name: string;
  last_name: string;
  specialization: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
}

interface Doctor {
  doctor_id: number;
  first_name: string;
  last_name: string;
  specialization: string;  // Энэ мөрийг НЭМСЭН
}

export default function AdminSchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newStartTime, setNewStartTime] = useState('');
  const [newEndTime, setNewEndTime] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (selectedDoctor) {
      fetchSchedules();
    }
  }, [selectedDoctor, selectedDate]);

  const fetchDoctors = async () => {
    const res = await fetch('/api/doctors');
    const data = await res.json();
    setDoctors(data);
    if (data.length > 0) {
      setSelectedDoctor(data[0].doctor_id.toString());
    }
    setLoading(false);
  };

  const fetchSchedules = async () => {
    let url = `/api/admin/schedules?doctorId=${selectedDoctor}`;
    if (selectedDate) url += `&date=${selectedDate}`;
    const res = await fetch(url);
    const data = await res.json();
    setSchedules(data);
  };

  const addSchedule = async () => {
    if (!newStartTime || !newEndTime) {
      alert('Цагаа бөглөнө үү');
      return;
    }
    setAdding(true);
    const res = await fetch('/api/admin/schedules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        doctorId: selectedDoctor,
        date: selectedDate || new Date().toISOString().split('T')[0],
        startTime: newStartTime,
        endTime: newEndTime,
      }),
    });
    if (res.ok) {
      alert('Хуваарь нэмэгдлээ');
      setNewStartTime('');
      setNewEndTime('');
      fetchSchedules();
    } else {
      const data = await res.json();
      alert(data.error);
    }
    setAdding(false);
  };

  const deleteSchedule = async (scheduleId: number) => {
    if (!confirm('Устгахдаа итгэлтэй байна уу?')) return;
    const res = await fetch(`/api/admin/schedules?scheduleId=${scheduleId}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      alert('Устгагдлаа');
      fetchSchedules();
    } else {
      alert('Алдаа гарлаа');
    }
  };

  if (loading) return <div className="text-center py-20">Уншиж байна...</div>;

  return (
    <div className="p-6">
      <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-gray-500 hover:text-teal-600 transition mb-4 group"
          aria-label="Буцах"
        >
          <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Буцах</span>
        </button>
      <h1 className="text-2xl font-bold mb-6"> Эмчийн ажлын хуваарь</h1>

      {/* Шүүлтүүр */}
      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Эмч сонгох</label>
            <select
              className="w-full border rounded-lg px-4 py-2"
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              aria-label="Эмч сонгох"
            >
              {doctors.map((doc) => (
                <option key={doc.doctor_id} value={doc.doctor_id}>
                  Dr. {doc.first_name} {doc.last_name} - {doc.specialization}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Огноо (заавал биш)</label>
            <input
              type="date"
              className="border rounded-lg px-4 py-2"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              aria-label="Огноо сонгох"
            />
          </div>
          <button
            onClick={fetchSchedules}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Хайх
          </button>
        </div>
      </div>

      {/* Шинэ хуваарь нэмэх */}
      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <h2 className="font-semibold mb-3"> Шинэ цаг нэмэх</h2>
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-sm text-gray-600">Эхлэх цаг</label>
            <input
              type="time"
              className="border rounded-lg px-3 py-2"
              value={newStartTime}
              onChange={(e) => setNewStartTime(e.target.value)}
              aria-label="Эхлэх цаг"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600">Дуусах цаг</label>
            <input
              type="time"
              className="border rounded-lg px-3 py-2"
              value={newEndTime}
              onChange={(e) => setNewEndTime(e.target.value)}
              aria-label="Дуусах цаг"
            />
          </div>
          <button
            onClick={addSchedule}
            disabled={adding}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {adding ? 'Нэмж байна...' : 'Нэмэх'}
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          {selectedDate ? `Огноо: ${selectedDate}` : 'Огноо сонгоогүй бол өнөөдрийн огноогоор нэмэгдэнэ'}
        </p>
      </div>

      {/* Хуваарийн жагсаалт */}
      {schedules.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
          Хуваарь байхгүй байна
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-x-auto">
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
                    <span className={`px-2 py-1 rounded-full text-xs ${s.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {s.status === 'available' ? 'Боломжтой' : s.status === 'booked' ? 'Захиалагдсан' : 'Боломжгүй'}
                    </span>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => deleteSchedule(s.schedule_id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Устгах
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
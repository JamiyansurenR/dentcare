'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
interface Appointment {
  appointment_id: number;
  doctor_first_name: string;
  doctor_last_name: string;
  specialization: string;
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

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filtered, setFiltered] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updating, setUpdating] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/admin/appointments')
      .then(res => {
        if (res.status === 401) router.push('/admin/login');
        return res.json();
      })
      .then(data => {
        setAppointments(data);
        setFiltered(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = [...appointments];
    
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(a => 
        `${a.patient_first_name} ${a.patient_last_name}`.toLowerCase().includes(s) ||
        `${a.doctor_first_name} ${a.doctor_last_name}`.toLowerCase().includes(s) ||
        a.service_name.toLowerCase().includes(s) ||
        a.patient_email.toLowerCase().includes(s)
      );
    }
    
    if (statusFilter !== 'all') {
      result = result.filter(a => a.status === statusFilter);
    }
    
    setFiltered(result);
  }, [search, statusFilter, appointments]);

  const updateStatus = async (id: number, status: string) => {
    setUpdating(id);
    const res = await fetch('/api/admin/appointments', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appointmentId: id, status }),
    });
    if (res.ok) {
      setAppointments(prev => prev.map(a => a.appointment_id === id ? { ...a, status } : a));
    }
    setUpdating(null);
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    completed: 'bg-blue-100 text-blue-800',
  };

  const statusText: Record<string, string> = {
    pending: 'Хүлээгдэж буй',
    confirmed: 'Баталгаажсан',
    cancelled: 'Цуцлагдсан',
    completed: 'Дууссан',
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
      <h1 className="text-2xl font-bold mb-6"> Захиалгын жагсаалт</h1>

      <div className="bg-white p-4 rounded-xl shadow mb-6 flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Хайх (өвчтөн, эмч, үйлчилгээ, имэйл)..."
          className="flex-1 border rounded-lg px-4 py-2"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="border rounded-lg px-4 py-2"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          aria-label="Төлөвөөр шүүх"
        >
          <option value="all">Бүх төлөв</option>
          <option value="pending">Хүлээгдэж буй</option>
          <option value="confirmed">Баталгаажсан</option>
          <option value="cancelled">Цуцлагдсан</option>
          <option value="completed">Дууссан</option>
        </select>
        <div className="text-gray-500 text-sm py-2">
          {filtered.length} / {appointments.length} захиалга
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">Захиалга байхгүй</div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Өвчтөн</th>
                <th className="p-3 text-left">Эмч</th>
                <th className="p-3 text-left">Үйлчилгээ</th>
                <th className="p-3 text-left">Огноо</th>
                <th className="p-3 text-left">Цаг</th>
                <th className="p-3 text-left">Үнэ</th>
                <th className="p-3 text-left">Төлөв</th>
                <th className="p-3 text-left">Үйлдэл</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => (
                <tr key={a.appointment_id} className="border-t hover:bg-gray-50">
                  <td className="p-3">
                    <div>{a.patient_first_name} {a.patient_last_name}</div>
                    <div className="text-xs text-gray-500">{a.patient_email}</div>
                    <div className="text-xs text-gray-500">{a.patient_phone}</div>
                  </td>
                  <td className="p-3">
                    Dr. {a.doctor_first_name} {a.doctor_last_name}
                    <div className="text-xs text-gray-500">{a.specialization}</div>
                  </td>
                  <td className="p-3">{a.service_name}</td>
                  <td className="p-3">{new Date(a.date).toLocaleDateString('mn-MN')}</td>
                  <td className="p-3">{a.time.substring(0, 5)}</td>
                  <td className="p-3 font-semibold text-blue-600">{a.price.toLocaleString()}₮</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${statusColors[a.status]}`}>
                      {statusText[a.status]}
                    </span>
                  </td>
                  <td className="p-3">
                    <select
                      value={a.status}
                      onChange={e => updateStatus(a.appointment_id, e.target.value)}
                      disabled={updating === a.appointment_id}
                      className="border rounded px-2 py-1 text-sm"
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
  );
}
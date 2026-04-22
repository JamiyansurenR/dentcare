'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PencilIcon, TrashIcon, PlusIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

interface Doctor {
  doctor_id: number;
  first_name: string;
  last_name: string;
  specialization: string;
  email: string;
  phone: string;
  experience: number;
  description: string;
  rating: number;
  active: boolean;
}

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    specialization: '',
    email: '',
    phone: '',
    experience: 0,
    description: '',
    active: true,
  });
  const router = useRouter();

  const fetchDoctors = async () => {
    const res = await fetch('/api/admin/doctors');
    if (res.status === 401) router.push('/admin/login');
    const data = await res.json();
    setDoctors(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingDoctor ? '/api/admin/doctors' : '/api/admin/doctors';
    const method = editingDoctor ? 'PUT' : 'POST';
    const body = editingDoctor ? { ...formData, doctorId: editingDoctor.doctor_id } : formData;

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      fetchDoctors();
      setShowModal(false);
      setEditingDoctor(null);
      setFormData({ firstName: '', lastName: '', specialization: '', email: '', phone: '', experience: 0, description: '', active: true });
    } else {
      alert('Алдаа гарлаа');
    }
  };

  const deleteDoctor = async (doctorId: number) => {
    if (!confirm('Энэ эмчийг устгахдаа итгэлтэй байна уу?')) return;
    const res = await fetch(`/api/admin/doctors?doctorId=${doctorId}`, { method: 'DELETE' });
    if (res.ok) fetchDoctors();
    else alert('Алдаа гарлаа');
  };

  const editDoctor = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setFormData({
      firstName: doctor.first_name,
      lastName: doctor.last_name,
      specialization: doctor.specialization,
      email: doctor.email,
      phone: doctor.phone,
      experience: doctor.experience,
      description: doctor.description,
      active: doctor.active,
    });
    setShowModal(true);
  };

  if (loading) return <div className="text-center py-20">Уншиж байна...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto">
   
        <div className="flex justify-between items-center mb-6">
            <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-gray-500 hover:text-teal-600 transition mb-4 group"
          aria-label="Буцах"
        >
          <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Буцах</span>
        </button>
          <h1 className="text-2xl font-bold"> Эмч нарын бүртгэл</h1>
          <button onClick={() => { setEditingDoctor(null); setFormData({ firstName: '', lastName: '', specialization: '', email: '', phone: '', experience: 0, description: '', active: true }); setShowModal(true); }} className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 flex items-center gap-2">
            <PlusIcon className="w-5 h-5" /> Шинэ эмч
          </button>
        </div>

        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr><th className="p-3">Нэр</th><th className="p-3">Мэргэжил</th><th className="p-3">Имэйл</th><th className="p-3">Утас</th><th className="p-3">Туршлага</th><th className="p-3">Үйлдэл</th></tr></thead>
            <tbody>
              {doctors.map(doc => (
                <tr key={doc.doctor_id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium">Dr. {doc.first_name} {doc.last_name}</td>
                  <td className="p-3">{doc.specialization}</td>
                  <td className="p-3">{doc.email}</td>
                  <td className="p-3">{doc.phone}</td>
                  <td className="p-3">{doc.experience} жил</td>
                  <td className="p-3 flex gap-2">
                    <button onClick={() => editDoctor(doc)} className="text-blue-500 hover:text-blue-700" aria-label="Засварлах"><PencilIcon className="w-5 h-5" /></button>
                    <button onClick={() => deleteDoctor(doc.doctor_id)} className="text-red-500 hover:text-red-700" aria-label="Устгах"><TrashIcon className="w-5 h-5" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">{editingDoctor ? 'Эмч засварлах' : 'Шинэ эмч нэмэх'}</h2>
              <form onSubmit={handleSubmit} className="space-y-3">
                <input type="text" placeholder="Нэр" className="w-full border rounded-lg p-2" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} required />
                <input type="text" placeholder="Овог" className="w-full border rounded-lg p-2" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} required />
                <input type="text" placeholder="Мэргэжил" className="w-full border rounded-lg p-2" value={formData.specialization} onChange={e => setFormData({ ...formData, specialization: e.target.value })} required />
                <input type="email" placeholder="Имэйл" className="w-full border rounded-lg p-2" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
                <input type="tel" placeholder="Утас" className="w-full border rounded-lg p-2" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                <input type="number" placeholder="Туршлага (жил)" className="w-full border rounded-lg p-2" value={formData.experience} onChange={e => setFormData({ ...formData, experience: parseInt(e.target.value) })} />
                <textarea placeholder="Тайлбар" className="w-full border rounded-lg p-2" rows={2} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                <label className="flex items-center gap-2"><input type="checkbox" checked={formData.active} onChange={e => setFormData({ ...formData, active: e.target.checked })} /> Идэвхтэй</label>
                <div className="flex gap-2 pt-2">
                  <button type="submit" className="flex-1 bg-teal-600 text-white py-2 rounded-lg">{editingDoctor ? 'Хадгалах' : 'Нэмэх'}</button>
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-300 py-2 rounded-lg">Цуцлах</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
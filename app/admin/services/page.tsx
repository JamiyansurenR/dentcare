'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PencilIcon, TrashIcon, PlusIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

interface Service {
  service_id: number;
  name: string;
  price: number;
  duration: number;
  description: string;
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    duration: 0,
    description: '',
  });
  const router = useRouter();

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/admin/services');
      if (res.status === 401) {
        router.push('/admin/login');
        return;
      }
      const data = await res.json();
      setServices(data);
    } catch (err) {
      console.error('Error fetching services:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = '/api/admin/services';
    const method = editingService ? 'PUT' : 'POST';
    const body = editingService 
      ? { ...formData, serviceId: editingService.service_id } 
      : formData;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        fetchServices();
        setShowModal(false);
        setEditingService(null);
        setFormData({ name: '', price: 0, duration: 0, description: '' });
      } else {
        const data = await res.json();
        alert(data.error || 'Алдаа гарлаа');
      }
    } catch (err) {
      alert('Серверт холбогдоход алдаа гарлаа');
    }
  };

  const deleteService = async (serviceId: number) => {
    if (!confirm('Энэ үйлчилгээг устгахдаа итгэлтэй байна уу?')) return;
    try {
      const res = await fetch(`/api/admin/services?serviceId=${serviceId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchServices();
      } else {
        alert('Алдаа гарлаа');
      }
    } catch (err) {
      alert('Серверт холбогдоход алдаа гарлаа');
    }
  };

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
         <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-gray-500 hover:text-teal-600 transition mb-4 group"
          aria-label="Буцах"
        >
          <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Буцах</span>
        </button>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold"> Үйлчилгээний бүртгэл</h1>
          <button 
            onClick={() => { 
              setEditingService(null); 
              setFormData({ name: '', price: 0, duration: 0, description: '' }); 
              setShowModal(true); 
            }} 
            className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" /> Шинэ үйлчилгээ
          </button>
        </div>

        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Үйлчилгээ</th>
                  <th className="p-3 text-left">Үнэ</th>
                  <th className="p-3 text-left">Хугацаа</th>
                  <th className="p-3 text-left">Тайлбар</th>
                  <th className="p-3 text-left">Үйлдэл</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service) => (
                  <tr key={service.service_id} className="border-t hover:bg-gray-50">
                    <td className="p-3 font-medium">{service.name}</td>
                    <td className="p-3 text-teal-600 font-semibold">{service.price.toLocaleString(undefined, { minimumFractionDigits: 0 })}₮</td>
                    <td className="p-3">{service.duration} минут</td>
                    <td className="p-3 text-gray-500">{service.description}</td>
                    <td className="p-3 flex gap-2">
                      <button 
                        onClick={() => { 
                          setEditingService(service); 
                          setFormData({ 
                            name: service.name, 
                            price: service.price, 
                            duration: service.duration, 
                            description: service.description || '' 
                          }); 
                          setShowModal(true); 
                        }} 
                        className="text-blue-500 hover:text-blue-700" 
                        aria-label="Засварлах"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => deleteService(service.service_id)} 
                        className="text-red-500 hover:text-red-700" 
                        aria-label="Устгах"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal - Шинэ/Засварлах цонх */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">
                {editingService ? 'Үйлчилгээ засварлах' : 'Шинэ үйлчилгээ нэмэх'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Үйлчилгээний нэр</label>
                  <input 
                    type="text" 
                    className="w-full border rounded-lg p-2" 
                    value={formData.name} 
                    onChange={e => setFormData({ ...formData, name: e.target.value })} 
                    required 
                      aria-label="Үйлчилгээний нэр"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Үнэ (₮)</label>
                  <input 
                    type="number" 
                    className="w-full border rounded-lg p-2" 
                    value={formData.price} 
                    onChange={e => setFormData({ ...formData, price: parseInt(e.target.value) })} 
                    required 
                     aria-label="Үнэ"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Хугацаа (минут)</label>
                  <input 
                    type="number" 
                    className="w-full border rounded-lg p-2" 
                    value={formData.duration} 
                    onChange={e => setFormData({ ...formData, duration: parseInt(e.target.value) })} 
                    required 
                      aria-label="Хугацаа (минут)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Тайлбар</label>
                  <textarea 
                    className="w-full border rounded-lg p-2" 
                    rows={2} 
                    value={formData.description} 
                    onChange={e => setFormData({ ...formData, description: e.target.value })} 
                     aria-label="Тайлбар"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="submit" className="flex-1 bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700">
                    {editingService ? 'Хадгалах' : 'Нэмэх'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)} 
                    className="flex-1 bg-gray-300 py-2 rounded-lg hover:bg-gray-400"
                  >
                    Цуцлах
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserCircleIcon, EnvelopeIcon, PhoneIcon, MapPinIcon, CakeIcon, IdentificationIcon } from '@heroicons/react/24/outline';
import BackButton from '../../components/BackButton';
interface PatientProfile {
  user_id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  birth_date: string;
  gender: string;
  insurance_no: string;
  avatar_url: string;
}

export default function PatientProfilePage() {
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetch('/api/patient/profile')
      .then(async (res) => {
        if (res.status === 401) {
          router.push('/login');
          return;
        }
        const data = await res.json();
        if (res.ok) {
          setProfile(data);
        } else {
          setError(data.error || 'Мэдээлэл олдсонгүй');
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Серверт холбогдоход алдаа гарлаа');
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch('/api/patient/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: profile?.first_name,
          lastName: profile?.last_name,
          email: profile?.email,
          phone: profile?.phone,
          address: profile?.address,
          birthDate: profile?.birth_date,
          gender: profile?.gender,
          insuranceNo: profile?.insurance_no,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('Мэдээлэл амжилттай шинэчлэгдлээ');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Серверт холбогдоход алдаа гарлаа');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof PatientProfile, value: any) => {
    setProfile(prev => prev ? { ...prev, [field]: value } : null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
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

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Мэдээлэл олдсонгүй</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
         <BackButton fallbackUrl="/dashboard" />
        <div className="flex items-center gap-3 mb-6">
          <UserCircleIcon className="w-8 h-8 text-teal-600" />
          <h1 className="text-2xl font-bold text-gray-800">Миний профайл</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6">
          {message && (
            <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-4">
              {message}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Нэр</label>
              <input
                type="text"
                value={profile.first_name || ''}
                onChange={(e) => handleChange('first_name', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                aria-label="Нэр"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Овог</label>
              <input
                type="text"
                value={profile.last_name || ''}
                onChange={(e) => handleChange('last_name', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                aria-label="Овог"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <EnvelopeIcon className="w-4 h-4" /> Имэйл
            </label>
            <input
              type="email"
              value={profile.email || ''}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              aria-label="Имэйл"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <PhoneIcon className="w-4 h-4" /> Утас
            </label>
            <input
              type="tel"
              value={profile.phone || ''}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              aria-label="Утас"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <MapPinIcon className="w-4 h-4" /> Хаяг
            </label>
            <input
              type="text"
              value={profile.address || ''}
              onChange={(e) => handleChange('address', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              aria-label="Хаяг"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <CakeIcon className="w-4 h-4" /> Төрсөн огноо
              </label>
              <input
                type="date"
                value={profile.birth_date || ''}
                onChange={(e) => handleChange('birth_date', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                aria-label="Төрсөн огноо"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Хүйс</label>
              <select
                value={profile.gender || ''}
                onChange={(e) => handleChange('gender', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                aria-label="Хүйс"
              >
                <option value="">Сонгох</option>
                <option value="male">Эрэгтэй</option>
                <option value="female">Эмэгтэй</option>
                <option value="other">Бусад</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <IdentificationIcon className="w-4 h-4" /> Даатгалын дугаар
            </label>
            <input
              type="text"
              value={profile.insurance_no || ''}
              onChange={(e) => handleChange('insurance_no', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              aria-label="Даатгалын дугаар"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 transition disabled:opacity-50"
          >
            {saving ? 'Хадгалж байна...' : 'Хадгалах'}
          </button>
        </form>
      </div>
    </div>
  );
}
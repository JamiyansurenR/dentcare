'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import BackButton from '../../components/BackButton';
import { 
  UserCircleIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon, 
  CameraIcon 
} from '@heroicons/react/24/outline';

interface DoctorProfile {
  user_id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  specialization: string;
  experience: number;
  description: string;
  rating: number;
  avatar_url: string;
}

export default function DoctorProfilePage() {
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/doctor/profile')
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

  // Зураг upload хийх функц
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Зөвхөн зураг файл оруулна уу');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Зургийн хэмжээ 2MB-аас бага байх ёстой');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    formData.append('userId', profile?.user_id.toString() || '');

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setProfile(prev => prev ? { ...prev, avatar_url: data.imageUrl } : null);
        setMessage('Зураг амжилттай солигдлоо');
        setTimeout(() => setMessage(''), 3000);
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('Холбогдоход алдаа гарлаа');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch('/api/doctor/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: profile?.first_name,
          lastName: profile?.last_name,
          email: profile?.email,
          phone: profile?.phone,
          address: profile?.address,
          specialization: profile?.specialization,
          experience: profile?.experience,
          description: profile?.description,
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

  const handleChange = (field: keyof DoctorProfile, value: any) => {
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
         <BackButton fallbackUrl="/doctor/dashboard" />
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

          {/*  ЗУРАГ UPLOAD ХЭСЭГ */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative cursor-pointer group">
              {profile.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt={profile.first_name} 
                  className="w-28 h-28 rounded-full border-4 border-teal-500 shadow-lg object-cover group-hover:opacity-80 transition"
                />
              ) : (
                <div className="w-28 h-28 rounded-full bg-gradient-to-r from-teal-400 to-cyan-400 flex items-center justify-center text-5xl shadow-lg group-hover:opacity-80 transition">
                  
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute bottom-0 right-0 bg-teal-600 text-white p-2 rounded-full shadow-lg hover:bg-teal-700 transition disabled:opacity-50"
                aria-label="Зураг солих"
              >
                <CameraIcon className="w-5 h-5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
                aria-label="true"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {uploading ? 'Хадгалж байна...' : ''}
            </p>
          </div>

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

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Мэргэжил</label>
            <input
              type="text"
              value={profile.specialization || ''}
              onChange={(e) => handleChange('specialization', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              aria-label="Мэргэжил"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Туршлага (жил)</label>
            <input
              type="number"
              value={profile.experience || 0}
              onChange={(e) => handleChange('experience', parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              aria-label="Туршлага жил"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Тайлбар</label>
            <textarea
              rows={3}
              value={profile.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              aria-label="Тайлбар"
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
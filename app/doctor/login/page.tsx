'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DoctorLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (res.ok && data.role === 'doctor') {
      router.push('/doctor/dashboard');
    } else {
      setError('Эмчийн нэвтрэх нэр эсвэл нууц үг буруу');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-teal-500 to-cyan-600">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-96">
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">👨‍⚕️</div>
          <h1 className="text-2xl font-bold text-gray-800">Эмчийн нэвтрэх</h1>
          <p className="text-gray-500 text-sm mt-1">Та өөрийн бүртгэлээр нэвтэрнэ үү</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Нэвтрэх нэр</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Нэвтрэх нэрээ оруулна уу"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Нууц үг</label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Нууц үгээ оруулна уу"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <div className="bg-red-50 text-red-500 text-sm p-2 rounded-lg text-center">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 transition disabled:opacity-50"
          >
            {loading ? 'Уншиж байна...' : 'Нэвтрэх'}
          </button>
        </form>
      </div>
    </div>
  );
}
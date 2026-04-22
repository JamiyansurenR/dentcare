'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Рольоос хамаарч чиглүүлэх
        if (data.role === 'admin') {
          router.push('/admin');
        } else if (data.role === 'doctor') {
          router.push('/doctor/dashboard');
        } else {
          // Өвчтөнийг эмч сонгох хуудас руу чиглүүлэх
          router.push('/doctors');
        }
      } else {
        setError(data.error || 'Нэвтрэхэд алдаа гарлаа');
      }
    } catch (err) {
      setError('Серверт холбогдоход алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
        <div className="text-center">
          <div className="text-5xl mb-2"></div>
          <h2 className="text-3xl font-extrabold text-gray-900">Нэвтрэх</h2>
          <p className="mt-2 text-sm text-gray-600">Та өөрийн бүртгэлээр нэвтэрнэ үү</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Нэвтрэх нэр
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                placeholder="Нэвтрэх нэр эсвэл утасны дугаар оруулна уу"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Нууц үг
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                placeholder="Нууц үгээ оруулна уу"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 transition duration-200"
          >
            {loading ? 'Уншиж байна...' : 'Нэвтрэх'}
          </button>

          <div className="text-center">
            <Link href="/register" className="text-sm text-teal-600 hover:text-teal-500">
              Бүртгүүлэх
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
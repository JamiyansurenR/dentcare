'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface User {
  user_id: number;
  username: string;
  email: string;
  role: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/admin/users')
      .then(res => {
        if (res.status === 401) router.push('/admin/login');
        return res.json();
      })
      .then(data => {
        setUsers(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const resetPassword = async (userId: number, username: string) => {
    const newPassword = prompt(`"${username}" хэрэглэгчийн шинэ нууц үг оруулна уу:`);
    if (newPassword && newPassword.length >= 6) {
      const res = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, newPassword }),
      });
      if (res.ok) {
        alert('Нууц үг амжилттай шинэчлэгдлээ');
      } else {
        alert('Алдаа гарлаа');
      }
    } else if (newPassword) {
      alert('Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой');
    }
  };

  if (loading) {
    return <div className="text-center py-20">Уншиж байна...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto">
        {/* Буцах товч */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-gray-500 hover:text-teal-600 transition mb-4 group"
          aria-label="Буцах"
        >
          <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Буцах</span>
        </button>

        <h1 className="text-2xl font-bold mb-6">👥 Хэрэглэгчийн жагсаалт</h1>

        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">ID</th>
                  <th className="p-3 text-left">Хэрэглэгчийн нэр</th>
                  <th className="p-3 text-left">Имэйл</th>
                  <th className="p-3 text-left">Роль</th>
                  <th className="p-3 text-left">Үйлдэл</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.user_id} className="border-t hover:bg-gray-50">
                    <td className="p-3">{user.user_id}</td>
                    <td className="p-3 font-medium">{user.username}</td>
                    <td className="p-3">{user.email}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        user.role === 'admin' ? 'bg-red-100 text-red-800' : 
                        user.role === 'doctor' ? 'bg-blue-100 text-blue-800' : 
                        'bg-green-100 text-green-800'
                      }`}>
                        {user.role === 'admin' ? 'Админ' : user.role === 'doctor' ? 'Эмч' : 'Өвчтөн'}
                      </span>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => resetPassword(user.user_id, user.username)}
                        className="bg-teal-600 text-white px-3 py-1 rounded text-sm hover:bg-teal-700 transition"
                      >
                        Нууц үг сэргээх
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
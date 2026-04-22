'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
interface Patient {
  user_id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  birth_date: string;
  gender: string;
  insurance_no: string;
  created_at: string;
}

export default function AdminPatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filtered, setFiltered] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetch('/api/admin/patients')
      .then(res => {
        if (res.status === 401) router.push('/admin/login');
        return res.json();
      })
      .then(data => {
        setPatients(data);
        setFiltered(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (search) {
      const s = search.toLowerCase();
      setFiltered(patients.filter(p => 
        `${p.first_name} ${p.last_name}`.toLowerCase().includes(s) ||
        p.email.toLowerCase().includes(s) ||
        p.phone?.includes(s)
      ));
    } else {
      setFiltered(patients);
    }
  }, [search, patients]);

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
      <h1 className="text-2xl font-bold mb-6"> Өвчтөнүүдийн жагсаалт</h1>

      {/* Хайлт */}
      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <input
          type="text"
          placeholder="Хайх (нэр, имэйл, утас)..."
          className="w-full md:w-96 border rounded-lg px-4 py-2"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="text-sm text-gray-500 mt-2">
          {filtered.length} / {patients.length} өвчтөн
        </div>
      </div>

      {/* Хүснэгт */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">Өвчтөн байхгүй</div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Нэр</th>
                <th className="p-3 text-left">Имэйл</th>
                <th className="p-3 text-left">Утас</th>
                <th className="p-3 text-left">Хүйс</th>
                <th className="p-3 text-left">Даатгал</th>
                <th className="p-3 text-left">Бүртгүүлсэн</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.user_id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium">{p.first_name} {p.last_name}</td>
                  <td className="p-3 text-gray-600">{p.email}</td>
                  <td className="p-3">{p.phone || '-'}</td>
                  <td className="p-3">
                    {p.gender === 'male' ? 'Эрэгтэй' : p.gender === 'female' ? 'Эмэгтэй' : '-'}
                  </td>
                  <td className="p-3">{p.insurance_no || '-'}</td>
                  <td className="p-3 text-gray-500">{new Date(p.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
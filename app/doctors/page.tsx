'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { StarIcon, CalendarIcon } from '@heroicons/react/24/solid';
import { CogIcon } from '@heroicons/react/24/outline';
import BackButton from '../components/BackButton';

interface Doctor {
  doctor_id: number;
  first_name: string;
  last_name: string;
  specialization: string;
  experience: number;
  description: string;
  rating: number;
  avatar_url: string;
}

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 9;

  useEffect(() => {
    // Хэрэглэгчийн төлөвийг шалгах
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => setUser(data.user));

    // Эмч нарыг татах
    fetch(`/api/doctors?page=${page}&limit=${limit}`)
      .then(res => res.json())
      .then(data => {
        setDoctors(data.doctors || []);
        setTotal(data.total || 0);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [page]);

  const totalPages = Math.ceil(total / limit);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Зөвхөн нэвтрээгүй үед буцах товч харуулах */}
        {!user && <BackButton fallbackUrl="/" />}

        <h1 className="text-3xl font-bold text-gray-800 mb-2"> Бүх эмч нар</h1>
        <p className="text-gray-500 mb-8">Манай {total} туршлагатай эмч нар</p>

        {doctors.length === 0 ? (
          <div className="text-center py-20 text-gray-500">Эмч байхгүй байна</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctors.map((doctor) => (
                <div key={doctor.doctor_id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
                  <div className="bg-gradient-to-r from-teal-500 to-cyan-500 h-24 relative">
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                      {doctor.avatar_url ? (
                        <img 
                          src={doctor.avatar_url} 
                          alt={doctor.first_name} 
                          className="rounded-full border-4 border-white shadow-lg w-16 h-16 object-cover" 
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center text-2xl">
                          
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="px-4 pb-4 pt-10 text-center">
                    <h3 className="font-bold text-gray-800">Dr. {doctor.first_name} {doctor.last_name}</h3>
                    <p className="text-teal-600 text-sm">{doctor.specialization}</p>
                    <p className="text-gray-500 text-xs mt-2 line-clamp-2">{doctor.description}</p>
                    <div className="flex items-center justify-center mt-2 space-x-2">
                      <div className="flex items-center gap-1">
                        <StarIcon className="w-3 h-3 text-yellow-400" />
                        <span className="text-xs text-gray-600">{doctor.rating || 'Шинэ'}</span>
                      </div>
                      <span className="text-gray-300 text-xs">•</span>
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-400">{doctor.experience} жил</span>
                      </div>
                    </div>
                    <Link href={`/booking/${doctor.doctor_id}`}>
                      <button className="mt-3 w-full bg-teal-600 text-white py-1.5 rounded-lg text-sm hover:bg-teal-700 transition">
                        Цаг захиалах
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Хуудаслалт */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <Link 
                  href={`/doctors?page=${page - 1}`} 
                  className={`px-3 py-1 rounded border ${page === 1 ? 'opacity-50 pointer-events-none text-gray-400' : 'hover:bg-gray-100'}`}
                >
                  ←
                </Link>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <Link 
                    key={p} 
                    href={`/doctors?page=${p}`} 
                    className={`px-3 py-1 rounded border ${p === page ? 'bg-teal-600 text-white' : 'hover:bg-gray-100'}`}
                  >
                    {p}
                  </Link>
                ))}
                <Link 
                  href={`/doctors?page=${page + 1}`} 
                  className={`px-3 py-1 rounded border ${page === totalPages ? 'opacity-50 pointer-events-none text-gray-400' : 'hover:bg-gray-100'}`}
                >
                  →
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
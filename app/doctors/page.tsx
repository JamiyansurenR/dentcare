import pool from '../lib/db';
import { UserGroupIcon, StarIcon } from '@heroicons/react/24/outline';
import { CalendarIcon } from '@heroicons/react/24/solid';
import BackButton from '../components/BackButton';
import Link from 'next/link';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '../lib/auth';
import { cookies } from 'next/headers';

async function getDoctors(page: number = 1, limit: number = 9) {
  const offset = (page - 1) * limit;
  const [rows] = await pool.query<any[]>(
    `SELECT d.doctor_id, d.specialization, d.experience, d.description, d.rating,
            p.first_name, p.last_name, p.avatar_url
     FROM doctors d
     JOIN profiles p ON d.profile_id = p.profile_id
     WHERE d.active = true
     ORDER BY d.doctor_id
     LIMIT ? OFFSET ?`,
    [limit, offset]
  );
  const [countRows] = await pool.query<any[]>('SELECT COUNT(*) as count FROM doctors WHERE active = true');
  
  const doctors = rows.map((d: any) => ({ 
    ...d, 
    rating: d.rating ? parseFloat(d.rating) : 0 
  }));
  return { doctors, total: countRows[0]?.count || 0 };
}

export default async function DoctorsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }> | { page?: string };
}) {
  const params = await searchParams;
  const page = parseInt(params.page || '1');
  const limit = 9;
  const { doctors, total } = await getDoctors(page, limit);
  const totalPages = Math.ceil(total / limit);

  // Session-ээс хэрэглэгчийн төлөвийг шалгах
  let user = null;
  try {
    const session = await getIronSession(
      { headers: { cookie: cookies().toString() } } as any,
      {} as any,
      sessionOptions
    );
    user = (session as any).user;
  } catch (error) {
    // Session алдааг үл тоомсорлох
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Зөвхөн нэвтрээгүй үед буцах товч харуулах */}
        {!user && <BackButton fallbackUrl="/" />}

        {/* Гарчиг */}
        <div className="flex items-center gap-3 mb-2">
          <UserGroupIcon className="w-8 h-8 text-teal-600" />
          <h1 className="text-3xl font-bold text-gray-800">Бүх эмч нар</h1>
        </div>
        <p className="text-gray-500 mb-8">Манай {total} туршлагатай эмч нар</p>

        {doctors.length === 0 ? (
          <div className="text-center py-20 text-gray-500">Эмч байхгүй байна</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctors.map((doctor: any) => (
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
                          👨‍⚕️
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="px-4 pb-4 pt-10 text-center">
                    <h3 className="font-bold text-gray-800">Dr. {doctor.first_name} {doctor.last_name}</h3>
                    <p className="text-teal-600 text-sm">{doctor.specialization}</p>
                    <p className="text-gray-500 text-xs mt-2 line-clamp-2">{doctor.description}</p>
                    
                    {/* Үнэлгээ */}
                    <div className="flex items-center justify-center mt-2 space-x-2">
                      <div className="flex items-center gap-1">
                        <StarIcon className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm text-gray-700">
                          {doctor.rating > 0 ? doctor.rating.toFixed(1) : 'Шинэ'}
                        </span>
                      </div>
                      <span className="text-gray-300 text-xs">•</span>
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-400 text-xs">{doctor.experience} жил</span>
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
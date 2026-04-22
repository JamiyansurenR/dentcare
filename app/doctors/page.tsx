import pool from '../lib/db';
import { UserGroupIcon, StarIcon } from '@heroicons/react/24/outline';
import ToothIcon from '../components/ToothIcon';
import BackButton from '../components/BackButton';
async function getDoctors(page: number = 1, limit: number = 9) {
  const offset = (page - 1) * limit;
  const [rows] = await pool.query<any[]>(
    `SELECT d.doctor_id, d.specialization, d.experience, d.description, d.rating,
            p.first_name, p.last_name, p.avatar_url
     FROM doctors d
     JOIN profiles p ON d.profile_id = p.profile_id
     WHERE d.active = true
     LIMIT ? OFFSET ?`,
    [limit, offset]
  );
  const [countRows] = await pool.query<any[]>('SELECT COUNT(*) as count FROM doctors WHERE active = true');
  return { doctors: rows, total: countRows[0]?.count || 0 };
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

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
          <BackButton fallbackUrl="/" />
        {/* Гарчиг - Icon нэмсэн */}
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
                          <ToothIcon className="w-8 h-8 text-teal-500" />
                      )}
                    </div>
                  </div>
                  <div className="px-4 pb-4 pt-10 text-center">
                    <h3 className="font-bold text-gray-800">Dr. {doctor.first_name} {doctor.last_name}</h3>
                    <p className="text-teal-600 text-sm">{doctor.specialization}</p>
                    <p className="text-gray-500 text-xs mt-2 line-clamp-2">{doctor.description}</p>
                    
                    {/* Үнэлгээний од - Icon-оор сольсон */}
                    <div className="flex items-center justify-center mt-2 space-x-2">
                      <div className="flex items-center gap-1">
                        <StarIcon className="w-3 h-3 text-yellow-400" />
                        <span className="text-xs text-gray-600">{doctor.rating || 'Шинэ'}</span>
                      </div>
                      <span className="text-gray-300 text-xs">•</span>
                      <span className="text-gray-400 text-xs">{doctor.experience} жил</span>
                    </div>
                    
                    <a href={`/booking/${doctor.doctor_id}`}>
                      <button className="mt-3 w-full bg-teal-600 text-white py-1.5 rounded-lg text-sm hover:bg-teal-700 transition">
                        Цаг захиалах
                      </button>
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Хуудаслалт */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <a 
                  href={`/doctors?page=${page - 1}`} 
                  className={`px-3 py-1 rounded border ${page === 1 ? 'opacity-50 pointer-events-none text-gray-400' : 'hover:bg-gray-100'}`}
                >
                  ←
                </a>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <a 
                    key={p} 
                    href={`/doctors?page=${p}`} 
                    className={`px-3 py-1 rounded border ${p === page ? 'bg-teal-600 text-white' : 'hover:bg-gray-100'}`}
                  >
                    {p}
                  </a>
                ))}
                <a 
                  href={`/doctors?page=${page + 1}`} 
                  className={`px-3 py-1 rounded border ${page === totalPages ? 'opacity-50 pointer-events-none text-gray-400' : 'hover:bg-gray-100'}`}
                >
                  →
                </a>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
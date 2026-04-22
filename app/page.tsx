import Link from 'next/link';
import pool from './lib/db';
import { StarIcon, CalendarIcon } from '@heroicons/react/24/solid';
import { UserGroupIcon, CogIcon } from '@heroicons/react/24/outline';
import ToothIcon from './components/ToothIcon';

async function getDoctors() {
  try {
    const [rows] = await pool.query<any[]>(`
      SELECT d.doctor_id, d.specialization, d.experience, d.description, d.rating,
             p.first_name, p.last_name, p.avatar_url
      FROM doctors d
      JOIN profiles p ON d.profile_id = p.profile_id
      WHERE d.active = true
      LIMIT 3
    `);
    return rows;
  } catch (error) {
    console.error('Doctors error:', error);
    return [];
  }
}

async function getServices() {
  try {
    const [rows] = await pool.query<any[]>('SELECT * FROM services LIMIT 4');
    return rows;
  } catch (error) {
    console.error('Services error:', error);
    return [];
  }
}

async function getCounts() {
  try {
    const [doctorsCount] = await pool.query<any[]>('SELECT COUNT(*) as count FROM doctors WHERE active = true');
    const [servicesCount] = await pool.query<any[]>('SELECT COUNT(*) as count FROM services');
    return {
      doctors: doctorsCount[0]?.count || 0,
      services: servicesCount[0]?.count || 0,
    };
  } catch (error) {
    return { doctors: 0, services: 0 };
  }
}

export default async function Home() {
  const doctors = await getDoctors();
  const services = await getServices();
  const counts = await getCounts();

  return (
    <div className="min-h-screen">
      {/* Hero хэсэг  */}
      <section className="relative bg-gradient-to-br from-teal-50 via-white to-cyan-50 overflow-hidden">
        {/* Дэвсгэр эффект */}
    <div className="absolute top-20 right-10 w-96 h-96 bg-teal-200 rounded-full opacity-40 blur-3xl"></div>
  <div className="absolute bottom-20 left-10 w-96 h-96 bg-cyan-200 rounded-full opacity-40 blur-3xl"></div>
      
        <div className="relative container mx-auto px-4 py-20 md:py-28 text-center">
          <div className="max-w-3xl mx-auto">
            {/* Гарчиг */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-6 leading-tight">
              Таны инээмсэглэл бидний эрхэм зорилго
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Мэргэжлийн эмч нар, орчин үеийн тоног төхөөрөмж, тав тухтай орчин
            </p>
            
            {/* Товчнууд */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <button className="w-full sm:w-auto bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-8 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300">
                  Цаг захиалах
                </button>
              </Link>
              
            </div>
          </div>
        </div>
      </section>

      {/* Үйлчилгээнүүд хэсэг */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Бидний үйлчилгээнүүд</h2>
            {counts.services > 4 && (
              <Link href="/services" className="text-teal-600 hover:text-teal-700 font-medium">
                Бүгдийг харах →
              </Link>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service: any) => (
              <div key={service.service_id} className="bg-gray-50 rounded-2xl p-6 text-center hover:shadow-lg transition">
                <CogIcon className="w-12 h-12 mx-auto text-teal-500 mb-3" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">{service.name}</h3>
                <p className="text-gray-500 text-sm mb-3">{service.description}</p>
                <p className="text-2xl font-bold text-teal-600">{Number(service.price).toLocaleString(undefined, { minimumFractionDigits: 0 })}₮</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Эмч нар хэсэг */}
      <section id="doctors" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Манай эмч нар</h2>
            {counts.doctors > 3 && (
              <Link href="/doctors" className="text-teal-600 hover:text-teal-700 font-medium">
                Бүгдийг харах →
              </Link>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {doctors.map((doctor: any) => (
              <div key={doctor.doctor_id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition">
                <div className="bg-gradient-to-r from-teal-500 to-cyan-500 h-28 relative">
                  <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2">
                    {doctor.avatar_url ? (
                      <img 
                        src={doctor.avatar_url} 
                        alt={doctor.first_name} 
                        className="rounded-full border-4 border-white shadow-lg w-20 h-20 object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center text-3xl">
                        
                      </div>
                    )}
                  </div>
                </div>
                <div className="px-6 pb-6 pt-12 text-center">
                  <h3 className="text-lg font-bold text-gray-800">Dr. {doctor.first_name} {doctor.last_name}</h3>
                  <p className="text-teal-600 font-medium text-sm mt-1">{doctor.specialization}</p>
                  <p className="text-gray-500 text-xs mt-2 line-clamp-2">{doctor.description}</p>
                  <div className="flex items-center justify-center mt-3 space-x-3">
                    <div className="flex items-center gap-1">
                      <StarIcon className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm text-gray-700">{doctor.rating || 'Шинэ'}</span>
                    </div>
                    <span className="text-gray-300 text-xs">•</span>
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-500 text-xs">{doctor.experience} жил</span>
                    </div>
                  </div>
                  <Link href={`/booking/${doctor.doctor_id}`}>
                    <button className="mt-4 w-full bg-teal-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-teal-700 transition">
                      Цаг захиалах
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
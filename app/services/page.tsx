import pool from '../lib/db';
import BackButton from '../components/BackButton';
import { CogIcon } from '@heroicons/react/24/outline';
async function getServices() {
  const [rows] = await pool.query<any[]>('SELECT * FROM services ORDER BY service_id');
  return rows;
}

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
         <BackButton />
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          
             Бүх үйлчилгээнүүд</h1>
        <p className="text-gray-500 mb-8">Бидний санал болгож буй бүх үйлчилгээнүүд</p>

        {services.length === 0 ? (
          <div className="text-center py-20 text-gray-500">Үйлчилгээ байхгүй байна</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service: any) => (
              <div key={service.service_id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
                <div className="text-5xl mb-3">
                    <CogIcon className="w-12 h-12 mx-auto text-teal-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{service.name}</h3>
                <p className="text-gray-500 text-sm mb-3">{service.description}</p>
                <p className="text-2xl font-bold text-teal-600">{Number(service.price).toLocaleString(undefined, { minimumFractionDigits: 0 })}₮</p>
                <p className="text-gray-400 text-xs mt-2">⏱ {service.duration} минут</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import BackButton from '../../components/BackButton';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { CogIcon } from '@heroicons/react/24/outline';
import { ClockIcon } from '@heroicons/react/24/outline';
interface Doctor {
  doctor_id: number;
  first_name: string;
  last_name: string;
  specialization: string;
  experience: number;
  description: string;
  rating: number;
}

interface Service {
  service_id: number;
  name: string;
  price: number;
  duration: number;
  description: string;
}

interface Schedule {
  schedule_id: number;
  start_time: string;
  end_time: string;
}

export default function BookingPage() {
  const { doctorId } = useParams();
  const router = useRouter();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  // Fetch doctor info
  useEffect(() => {
    if (doctorId) {
      fetch(`/api/doctors/${doctorId}`)
        .then(res => res.json())
        .then(data => setDoctor(data))
        .catch(err => console.error(err));
    }
  }, [doctorId]);

  // Fetch services
  useEffect(() => {
    fetch('/api/services')
      .then(res => res.json())
      .then(data => setServices(data))
      .catch(err => console.error(err));
  }, []);

  // Fetch schedules when date is selected
  useEffect(() => {
    if (selectedDate && doctorId) {
      fetch(`/api/schedules?doctorId=${doctorId}&date=${selectedDate}`)
        .then(res => res.json())
        .then(data => setSchedules(data))
        .catch(err => console.error(err));
    }
  }, [selectedDate, doctorId]);

  const handleBooking = async () => {
    if (!selectedService || !selectedSchedule || !selectedDate) {
      setError('Бүх талбарыг бөглөнө үү');
      return;
    }

    setLoading(true);
    setError('');

    const schedule = schedules.find(s => s.schedule_id === selectedSchedule);

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: parseInt(doctorId as string),
          serviceId: selectedService,
          scheduleId: selectedSchedule,
          date: selectedDate,
          time: schedule?.start_time,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert('Захиалга амжилттай!');
        router.push('/dashboard');
      } else {
        setError(data.error || 'Алдаа гарлаа');
      }
    } catch (err) {
      setError('Серверт холбогдоход алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  if (!doctor) {
    return <div className="text-center py-20 text-gray-500">Уншиж байна...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
         <BackButton fallbackUrl="/doctors" />
      <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
          Цаг захиалах
        </h1>
        <p className="text-gray-600 mb-6">
          Dr. {doctor.first_name} {doctor.last_name} - {doctor.specialization}
        </p>

        {/* Step indicator */}
        <div className="flex mb-8">
          <div className={`flex-1 text-center pb-2 border-b-2 ${step >= 1 ? 'border-blue-500 text-blue-600' : 'border-gray-300 text-gray-400'}`}>
            1. Үйлчилгээ
          </div>
          <div className={`flex-1 text-center pb-2 border-b-2 ${step >= 2 ? 'border-blue-500 text-blue-600' : 'border-gray-300 text-gray-400'}`}>
            2. Огноо
          </div>
          <div className={`flex-1 text-center pb-2 border-b-2 ${step >= 3 ? 'border-blue-500 text-blue-600' : 'border-gray-300 text-gray-400'}`}>
            3. Цаг
          </div>
        </div>

        {/* Step 1: Service selection */}
        {step === 1 && (
          <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
      <CogIcon className="w-5 h-5 text-teal-600" />
      Үйлчилгээ сонгох
    </h2>
            <div className="space-y-3">
              {services.map((service) => (
                <label
                  key={service.service_id}
                  className={`flex justify-between items-center p-4 border rounded-xl cursor-pointer transition ${selectedService === service.service_id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                >
                  <div className="flex-1">
                    <div className="font-semibold">{service.name}</div>
                    <div className="text-sm text-gray-500">{service.description}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-blue-600">{service.price.toLocaleString(undefined, { minimumFractionDigits: 0 })}₮</div>
                    <div className="text-xs text-gray-400">{service.duration} мин</div>
                  </div>
                  <input
                    type="radio"
                    name="service"
                    value={service.service_id}
                    checked={selectedService === service.service_id}
                    onChange={() => setSelectedService(service.service_id)}
                    className="ml-4 w-5 h-5"
                  />
                </label>
              ))}
            </div>
            <button
              onClick={() => setStep(2)}
              disabled={!selectedService}
              className="mt-6 w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
            >
              Үргэлжлүүлэх
            </button>
          </div>
        )}

        {/* Step 2: Date selection */}
     
{step === 2 && (
  <div>
    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
      <CalendarIcon className="w-5 h-5 text-teal-600" />
      Огноо сонгох
    </h2>
    <input
      type="date"
      value={selectedDate}
      onChange={(e) => setSelectedDate(e.target.value)}
      min={new Date().toISOString().split('T')[0]}
      max={new Date(Date.now() + 155 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
      className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
      aria-label="Огноо сонгох"
    />
    <div className="flex gap-3 mt-6">
      <button
        onClick={() => setStep(1)}
        className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition"
      >
        Буцах
      </button>
      <button
        onClick={() => setStep(3)}
        disabled={!selectedDate}
        className="flex-1 bg-teal-600 text-white py-3 rounded-xl font-semibold hover:bg-teal-700 disabled:opacity-50 transition"
      >
        Үргэлжлүүлэх
      </button>
    </div>
  </div>
)}

        {/* Step 3: Time selection */}
        {step === 3 && (
          <div>
           <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
      <ClockIcon className="w-5 h-5 text-teal-600" />
      Цаг сонгох
    </h2>
            {schedules.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Сонгосон огноонд боломжтой цаг байхгүй байна.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {schedules.map((schedule) => (
                  <button
                    key={schedule.schedule_id}
                    onClick={() => setSelectedSchedule(schedule.schedule_id)}
                    className={`py-3 rounded-xl border transition ${selectedSchedule === schedule.schedule_id ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-700 hover:border-blue-400'}`}
                  >
                    {schedule.start_time.substring(0, 5)}
                  </button>
                ))}
              </div>
            )}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep(2)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition"
              >
                Буцах
              </button>
              <button
                onClick={handleBooking}
                disabled={!selectedSchedule || loading}
                className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 transition"
              >
                {loading ? 'Уншиж байна...' : 'Захиалга баталгаажуулах'}
              </button>
            </div>
            {error && (
              <div className="mt-4 text-red-500 text-sm text-center bg-red-50 p-2 rounded">
                {error}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
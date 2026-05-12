'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { StarIcon, TrashIcon, ArrowLeftIcon} from '@heroicons/react/24/outline';

interface Review {
  review_id: number;
  doctor_id: number;
  doctor_name: string;
  specialization: string;
  patient_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/admin/reviews');
      if (res.status === 401) {
        router.push('/admin/login');
        return;
      }
      const data = await res.json();
      setReviews(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteReview = async (reviewId: number) => {
    if (!confirm('Энэ сэтгэгдлийг устгахдаа итгэлтэй байна уу?')) return;
    
    const res = await fetch(`/api/admin/reviews?reviewId=${reviewId}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      fetchReviews();
    } else {
      alert('Устгахад алдаа гарлаа');
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  if (loading) {
    return <div className="text-center py-20">Уншиж байна...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-gray-500 hover:text-teal-600 transition mb-4 group"
          aria-label="Буцах"
        >
          <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Буцах</span>
        </button>
        <h1 className="text-2xl font-bold mb-6"> Эмчийн үнэлгээ, сэтгэгдлүүд</h1>

        {reviews.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
            Үнэлгээ байхгүй байна
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.review_id} className="bg-white rounded-xl shadow-md p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">Dr. {review.doctor_name}</h3>
                    <p className="text-sm text-gray-500">{review.specialization}</p>
                  </div>
                  <button
                    onClick={() => deleteReview(review.review_id)}
                    className="text-red-500 hover:text-red-700"
                    aria-label="Устгах"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarIcon
                        key={star}
                        className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(review.created_at).toLocaleDateString('mn-MN')}
                  </span>
                </div>
                
                {review.comment && (
                  <p className="text-gray-700 mt-2 italic">"{review.comment}"</p>
                )}
                
                <p className="text-xs text-gray-400 mt-2">
                  Өвчтөн: {review.patient_name}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
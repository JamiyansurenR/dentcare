'use client';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function BackButton({ fallbackUrl = '/' }: { fallbackUrl?: string }) {
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length > 2) {
      router.back();
    } else {
      router.push(fallbackUrl);
    }
  };

  return (
    <button
      onClick={handleBack}
      className="inline-flex items-center gap-2 text-gray-500 hover:text-teal-600 transition mb-4 group"
      aria-label="Буцах"
    >
      <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
      <span>Буцах</span>
    </button>
  );
}
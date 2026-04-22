export default function ToothIcon({ className = "w-6 h-6" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
        d="M12 4C8 4 6 6 6 10v6c0 4 2 6 6 6s6-2 6-6v-6c0-4-2-6-6-6z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
        d="M9 12h6M9 8h6M12 16v2" />
    </svg>
  );
}
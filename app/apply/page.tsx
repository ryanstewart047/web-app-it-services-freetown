'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ApplyPageRedirect() {
  const router = useRouter();

  useEffect(() => {
    const search = typeof window !== 'undefined' ? window.location.search : '';
    router.replace(`/careers/apply${search}`);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-900">
      <div className="text-center p-6 max-w-sm">
        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <h2 className="text-base font-bold text-gray-900">Opening Application Portal...</h2>
        <p className="text-xs text-gray-500 mt-1">Directing you to the official BridgeTech Technician &amp; Artisan application page.</p>
      </div>
    </div>
  );
}
